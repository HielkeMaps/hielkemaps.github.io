# Addon update watcher (AI-assisted)

Notifies a Discord channel when any add-on that **TreeCapitator** advertises
compatibility with (see `wiki/treecapitator/compatibility.html`) ships an update —
and uses **Claude** to read the changelog and tell you whether the change touches
**trees / wood / logs / leaves / axes** (i.e. whether you should re-test compatibility).

## How it works

For each add-on the checker:

1. **Fetches** its [chunk.gg](https://chunk.gg) page (a community add-on browser).
   chunk.gg is server-rendered, so a plain HTTP request already contains the
   changelog and an `updated on <date>` line — no headless browser or API key needed.
   (minecraft.net blocks bots; chunk.gg's own API is auth-only.)
2. **Gates on a signal** — the `updated on <date>` string. If it's the same as last
   run, nothing changed and it stops there (no AI call, no spam).
3. On a **new date**, sends the page text to **Claude (Haiku)** via the `claude` CLI,
   which returns the latest version, a summary, and whether the update is tree/axe-related.
4. **Posts to Discord** — 🌳 + an orange embed when it's tree/axe-relevant (re-check
   compatibility!), 🔄 + green otherwise.

The first time an add-on is seen, its state is recorded silently (no notification).

### Files

- `addons.json` — watched add-ons (chunk.gg URL + the `updated on` signal pattern).
- `check.mjs` — the checker (Node, no npm dependencies; uses the `claude` CLI for AI).
- `state.json` — last-seen signal/version per add-on. Committed back automatically by
  the workflow. Edit by hand only to reset a baseline.
- `../workflows/addon-watch.yml` — runs daily (and on manual dispatch).

## Required setup (two repository secrets)

Add these under **Settings → Secrets and variables → Actions → New repository secret**:

1. **`DISCORD_WEBHOOK_URL`** — a Discord channel webhook
   (channel → Edit → Integrations → Webhooks → New Webhook → Copy URL).
2. **`CLAUDE_CODE_OAUTH_TOKEN`** — uses your Claude subscription instead of a paid API key.
   Generate it locally with:
   ```
   claude setup-token
   ```
   (opens a browser, prints a `sk-ant-oat01-…` token; lasts ~1 year). Works on Pro or Max.
   CI usage draws from your monthly agent-credit pool, but this watcher only calls Claude
   when a changelog actually changes — and uses Haiku — so it costs pennies.

Without `CLAUDE_CODE_OAUTH_TOKEN` the watcher still runs and still notifies on changes —
it just won't include the AI tree/axe analysis.

## Run / test

- **In CI:** Actions → **Addon update watcher** → *Run workflow*.
- **Locally:**
  ```
  node check.mjs --dry-run    # fetch + analyze, but don't notify or save state
  node check.mjs --mock-ai    # fake the AI step (no token needed) to test the plumbing
  ```

## Adding / changing a watched add-on

1. Add an entry to `addons.json` (`name`, `creator`, `watch_url`, `signal_pattern`,
   optional `marketplace_url`). Find the add-on on chunk.gg and use its
   `https://chunk.gg/@<creator>/<slug>` URL.
2. Test: `node check.mjs --dry-run`.
3. Commit — the next run records the baseline and watches from there.

If a check reports `signal_pattern did not match`, chunk.gg changed its page layout —
update the `signal_pattern`.
