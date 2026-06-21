# Addon update watcher

Notifies a Discord channel when any add-on that **TreeCapitator** advertises
compatibility with (see `wiki/treecapitator/compatibility.html`) ships a new
version, so you can re-test compatibility.

## How it works

- `addons.json` — the list of add-ons to watch. Each entry has a `watch_url` and a
  `pattern` (a regex whose **first capture group** is the version/update "signal").
- `check.mjs` — fetches each `watch_url`, extracts the signal, and compares it to the
  last-seen value in `state.json`. Changed signals are posted to Discord.
- `state.json` — last-seen signal per add-on. Committed back automatically by the
  workflow after each run. (Edit by hand only if you want to reset a baseline.)
- `../workflows/addon-watch.yml` — runs the check daily (and on manual dispatch).

The first time an add-on appears in `addons.json`, its current signal is recorded
silently — you only get notified on subsequent *changes*, never on the baseline.

Minecraft Marketplace pages (`minecraft.net`) block bots, so each add-on is watched
via a bot-accessible mirror (`bedrockexplorer.com` / `chunk.gg`) or the creator's own
changelog instead. The `marketplace_url` field is only used to enrich notifications.

## Required setup

Add one repository secret:

- **`DISCORD_WEBHOOK_URL`** — a Discord channel webhook
  (channel → Edit → Integrations → Webhooks → New Webhook → Copy URL).
  Add it under **Settings → Secrets and variables → Actions → New repository secret**.

Without the secret the workflow still runs and tracks versions, but won't post.

## Adding or changing a watched add-on

1. Add an entry to `addons.json` with a `watch_url` and a `pattern`.
2. Test it locally: `node .github/addon-watch/check.mjs --dry-run`
   (prints what it would do; doesn't notify or write state).
3. Commit. The next run records the baseline and watches from there.

If a check starts reporting `pattern did not match`, the source page changed its
layout — update that add-on's `pattern`.

## Run manually

GitHub → Actions → **Addon update watcher** → *Run workflow*.
