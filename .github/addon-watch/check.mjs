#!/usr/bin/env node
// Addon update watcher (AI-assisted) for TreeCapitator's compatible add-ons.
//
// Each add-on is watched via chunk.gg, whose pages are server-rendered: a plain
// HTTP fetch already contains the changelog text and an "updated on <date>" line
// (no headless browser or API key needed — the chunk.gg API itself is auth-only).
//
// Pipeline per add-on:
//   1. Fetch the page and strip it to text.
//   2. Read the "updated on <date>" signal. If it matches the last run -> skip.
//   3. On a new date, ask Claude (Haiku, via the `claude` CLI) to read the changelog,
//      extract the latest version, and judge whether the update touched
//      TREES / WOOD / LOGS / LEAVES / AXES (which affects TreeCapitator compatibility).
//   4. Notify Discord, highlighting tree/axe relevance.
//
// The first time an add-on is seen, its state is recorded silently (no notification).
//
// Usage:
//   node check.mjs              # full run
//   node check.mjs --dry-run    # fetch + analyze, but don't notify or save state
//   node check.mjs --mock-ai    # skip the real Claude call, fake the analysis (testing)
//
// Env:
//   DISCORD_WEBHOOK_URL       Discord webhook to post to (required to notify)
//   CLAUDE_CODE_OAUTH_TOKEN   token from `claude setup-token` (required for AI analysis)
//   CLAUDE_MODEL              override analysis model (default: claude-haiku-4-5-20251001)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, "addons.json");
const STATE_PATH = join(__dirname, "state.json");

const DRY_RUN = process.argv.includes("--dry-run");
const MOCK_AI = process.argv.includes("--mock-ai");
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL || "";
const MODEL = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";
const UA = "Mozilla/5.0 (compatible; HielkeMapsAddonWatcher/1.0; +https://hielkemaps.com)";

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`Failed to parse ${path}: ${e.message}`);
    return fallback;
  }
}

const ENTITIES = { "&quot;": '"', "&amp;": "&", "&#39;": "'", "&apos;": "'", "&lt;": "<", "&gt;": ">", "&nbsp;": " " };

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&#?[a-z0-9]+;/gi, (m) => ENTITIES[m.toLowerCase()] ?? " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function fetchText(url) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return htmlToText(await res.text());
  } finally {
    clearTimeout(t);
  }
}

// The change signal: the "updated on <date>" string chunk.gg renders for every
// product. Gating on just this avoids needless AI calls from unrelated page churn.
function extractSignal(addon, text) {
  const m = text.match(new RegExp(addon.signal_pattern, "i"));
  return m ? (m[1] ?? m[0]).replace(/\s+/g, " ").trim() : null;
}

// --- AI analysis -------------------------------------------------------------

function runClaude(prompt, stdinText) {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["-p", prompt, "--model", MODEL, "--output-format", "json"], {
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "";
    let err = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve(out) : reject(new Error(`claude exited ${code}: ${err.slice(0, 500)}`))
    );
    child.stdin.write(stdinText);
    child.stdin.end();
  });
}

function parseAiJson(cliOutput) {
  let resultText = cliOutput;
  try {
    resultText = JSON.parse(cliOutput).result ?? cliOutput; // unwrap --output-format json
  } catch {
    /* maybe bare text */
  }
  const fenced = resultText.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonText = fenced ? fenced[1] : resultText;
  const braced = jsonText.match(/\{[\s\S]*\}/);
  return JSON.parse(braced ? braced[0] : jsonText);
}

async function analyze(addon, pageText) {
  if (MOCK_AI) {
    return {
      latest_version: "MOCK-" + createHash("sha256").update(pageText).digest("hex").slice(0, 6),
      tree_axe_relevant: true,
      headline: `[mock] ${addon.name} changelog changed`,
      summary: "Mock analysis (no real Claude call).",
    };
  }
  const prompt =
    `You are monitoring the changelog page of a Minecraft Bedrock add-on named ` +
    `"${addon.name}" by ${addon.creator}. The page's visible text is on stdin.\n\n` +
    `This add-on is listed as compatible with "TreeCapitator", which fells whole trees, ` +
    `so I specifically care about changes to TREES, WOOD/LOG blocks, LEAVES, or AXES/tools.\n\n` +
    `Respond with ONLY a single JSON object (no prose, no code fences):\n` +
    `{\n` +
    `  "latest_version": "newest version/update identifier you can find (string)",\n` +
    `  "tree_axe_relevant": boolean (did the most recent update touch trees, wood, logs, leaves, or axes?),\n` +
    `  "headline": "one short sentence describing the latest update",\n` +
    `  "summary": "2-3 sentences; if tree/axe relevant, say what changed and why it may affect TreeCapitator"\n` +
    `}\n` +
    `If no version number exists, use the latest changelog entry title or update date as latest_version.`;
  return parseAiJson(await runClaude(prompt, pageText.slice(0, 16000)));
}

// --- Discord -----------------------------------------------------------------

async function postDiscord(changes) {
  if (!WEBHOOK) {
    console.warn("DISCORD_WEBHOOK_URL not set — skipping Discord notification.");
    return;
  }
  for (let i = 0; i < changes.length; i += 10) {
    const batch = changes.slice(i, i + 10);
    const embeds = batch.map((c) => {
      const rel = c.tree_axe_relevant;
      return {
        title: `${rel ? "🌳" : "🔄"} ${c.name} — ${c.to}`,
        url: c.watch_url,
        description:
          (c.headline ? `${c.headline}\n\n` : "") +
          (c.summary ? `${c.summary}\n\n` : "") +
          `by ${c.creator}\n` +
          (rel === true
            ? "⚠️ **Touches trees/axes — re-check TreeCapitator compatibility.**\n"
            : rel === false
              ? "No tree/axe-related changes detected.\n"
              : "") +
          `[changelog](${c.watch_url})` +
          (c.marketplace_url ? ` · [marketplace](${c.marketplace_url})` : ""),
        color: rel ? 0xe67e22 : 0x4caf50,
        footer: { text: "TreeCapitator compatibility watcher" },
        timestamp: new Date().toISOString(),
      };
    });
    const relevantCount = batch.filter((c) => c.tree_axe_relevant).length;
    const body = {
      username: "Addon Update Watcher",
      content:
        i === 0
          ? `**${changes.length} compatible add-on${changes.length > 1 ? "s" : ""} updated** — ` +
            `${relevantCount} may affect trees/axes.`
          : undefined,
      embeds,
    };
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Discord webhook failed: HTTP ${res.status} ${await res.text()}`);
  }
}

function appendSummary(lines) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  try {
    writeFileSync(file, lines.join("\n") + "\n", { flag: "a" });
  } catch {
    /* non-fatal */
  }
}

// --- Main --------------------------------------------------------------------

async function main() {
  const config = loadJson(CONFIG_PATH, null);
  if (!config || !Array.isArray(config.addons)) {
    console.error("addons.json missing or invalid.");
    process.exit(1);
  }
  const state = loadJson(STATE_PATH, {});
  const aiAvailable = MOCK_AI || !!process.env.CLAUDE_CODE_OAUTH_TOKEN;
  if (!aiAvailable) {
    console.warn("CLAUDE_CODE_OAUTH_TOKEN not set — notifying on changes without AI analysis.");
  }

  const changes = [];
  const summary = ["## Addon update check", ""];

  for (const addon of config.addons) {
    const { name } = addon;
    try {
      const text = await fetchText(addon.watch_url);
      const signal = extractSignal(addon, text);
      if (!signal) throw new Error("signal_pattern did not match (page layout changed?)");
      const prev = state[name];

      if (prev && prev.signal === signal) {
        console.log(`[same]     ${name}: ${signal}`);
        summary.push(`- ✅ **${name}** — unchanged (${signal})`);
        continue;
      }

      // New "updated on" date (or first time) -> analyze.
      let ai = null;
      if (aiAvailable) {
        try {
          ai = await analyze(addon, text);
        } catch (e) {
          console.error(`[ai-error] ${name}: ${e.message}`);
        }
      }
      const version = ai?.latest_version ?? signal;

      if (!prev) {
        console.log(`[baseline] ${name}: ${signal} (${version})`);
        summary.push(`- ⚪ **${name}** — baseline recorded (${version})`);
      } else {
        console.log(`[changed]  ${name}: ${prev.version ?? prev.signal} -> ${version}`);
        summary.push(
          `- ${ai?.tree_axe_relevant ? "🌳" : "🔄"} **${name}** — \`${prev.version ?? prev.signal}\` → \`${version}\`` +
            (ai?.tree_axe_relevant ? " (tree/axe relevant)" : "")
        );
        changes.push({
          name,
          creator: addon.creator,
          watch_url: addon.watch_url,
          marketplace_url: addon.marketplace_url,
          from: prev.version ?? prev.signal,
          to: version,
          tree_axe_relevant: ai?.tree_axe_relevant ?? null,
          headline: ai?.headline ?? null,
          summary: ai?.summary ?? null,
        });
      }

      state[name] = {
        signal,
        version,
        tree_axe_relevant: ai?.tree_axe_relevant ?? null,
        checked_at: new Date().toISOString(),
      };
    } catch (e) {
      console.error(`[error]    ${name}: ${e.message}`);
      summary.push(`- ⚠️ **${name}** — check failed: ${e.message}`);
      // keep previous state on transient failure
    }
  }

  if (changes.length && !DRY_RUN) {
    await postDiscord(changes);
    console.log(`Notified Discord about ${changes.length} change(s).`);
  } else if (changes.length) {
    console.log(`[dry-run] would notify Discord about ${changes.length} change(s).`);
  }

  if (!DRY_RUN) writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
  appendSummary(summary);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
