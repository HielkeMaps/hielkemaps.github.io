#!/usr/bin/env node
// Addon update watcher for TreeCapitator's compatible add-ons.
//
// Fetches each add-on's `watch_url`, extracts a version/update "signal" using its
// `pattern`, and compares it against the last-seen signal stored in state.json.
// When a signal changes, it posts a notification to a Discord webhook.
//
// First time an add-on is seen (no prior state), its signal is recorded silently
// so you don't get a flood of "updates" on the very first run.
//
// Usage:
//   node check.mjs            # fetch, compare, notify, write state
//   node check.mjs --dry-run  # fetch + compare + print, but don't notify or write state
//
// Env:
//   DISCORD_WEBHOOK_URL  Discord webhook to post change notifications to (required to notify)

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, "addons.json");
const STATE_PATH = join(__dirname, "state.json");

const DRY_RUN = process.argv.includes("--dry-run");
const WEBHOOK = process.env.DISCORD_WEBHOOK_URL || "";
const UA =
  "Mozilla/5.0 (compatible; HielkeMapsAddonWatcher/1.0; +https://hielkemaps.com)";

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`Failed to parse ${path}: ${e.message}`);
    return fallback;
  }
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "text/html,*/*" },
      redirect: "follow",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  } finally {
    clearTimeout(timeout);
  }
}

function extractSignal(html, pattern) {
  const m = html.match(new RegExp(pattern));
  if (!m) return null;
  // First capture group, else the whole match; collapse whitespace.
  return (m[1] ?? m[0]).replace(/\s+/g, " ").trim();
}

async function postDiscord(changes) {
  if (!WEBHOOK) {
    console.warn("DISCORD_WEBHOOK_URL not set — skipping Discord notification.");
    return;
  }
  // Discord allows up to 10 embeds per message.
  for (let i = 0; i < changes.length; i += 10) {
    const batch = changes.slice(i, i + 10);
    const embeds = batch.map((c) => ({
      title: `🔄 ${c.name} updated`,
      url: c.watch_url,
      description:
        `**${c.from ?? "—"} → ${c.to}**\n` +
        `by ${c.creator}\n` +
        `[changelog/source](${c.watch_url})` +
        (c.marketplace_url ? ` · [marketplace](${c.marketplace_url})` : ""),
      color: 0x4caf50,
      footer: { text: "TreeCapitator compatibility watcher" },
      timestamp: new Date().toISOString(),
    }));
    const body = {
      username: "Addon Update Watcher",
      content:
        changes.length > 1 && i === 0
          ? `**${changes.length} compatible add-ons have updates** — you may want to re-test TreeCapitator compatibility.`
          : undefined,
      embeds,
    };
    const res = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`Discord webhook failed: HTTP ${res.status} ${await res.text()}`);
    }
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

async function main() {
  const config = loadJson(CONFIG_PATH, null);
  if (!config || !Array.isArray(config.addons)) {
    console.error("addons.json missing or invalid.");
    process.exit(1);
  }
  const state = loadJson(STATE_PATH, {});

  const changes = [];
  const errors = [];
  const summary = ["## Addon update check", ""];

  for (const addon of config.addons) {
    const { name } = addon;
    try {
      const html = await fetchText(addon.watch_url);
      const signal = extractSignal(html, addon.pattern);
      if (!signal) {
        throw new Error("pattern did not match (page layout may have changed)");
      }
      const prev = state[name]?.signal;
      if (prev === undefined) {
        console.log(`[baseline] ${name}: ${signal}`);
        summary.push(`- ⚪ **${name}** — baseline recorded: \`${signal}\``);
      } else if (prev !== signal) {
        console.log(`[changed]  ${name}: ${prev} -> ${signal}`);
        summary.push(`- 🔄 **${name}** — \`${prev}\` → \`${signal}\``);
        changes.push({
          name,
          creator: addon.creator,
          watch_url: addon.watch_url,
          marketplace_url: addon.marketplace_url,
          from: prev,
          to: signal,
        });
      } else {
        console.log(`[same]     ${name}: ${signal}`);
        summary.push(`- ✅ **${name}** — unchanged (\`${signal}\`)`);
      }
      state[name] = { signal, checked_at: new Date().toISOString() };
    } catch (e) {
      console.error(`[error]    ${name}: ${e.message}`);
      summary.push(`- ⚠️ **${name}** — check failed: ${e.message}`);
      errors.push({ name, error: e.message });
      // Keep previous state so a transient failure doesn't lose the baseline.
    }
  }

  if (changes.length && !DRY_RUN) {
    await postDiscord(changes);
    console.log(`Notified Discord about ${changes.length} change(s).`);
  } else if (changes.length) {
    console.log(`[dry-run] would notify Discord about ${changes.length} change(s).`);
  }

  if (!DRY_RUN) {
    writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + "\n");
  }

  appendSummary(summary);

  // Don't fail the workflow on individual site hiccups; only note them.
  if (errors.length) {
    console.warn(`${errors.length} addon check(s) failed (see above).`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
