---
description: "Create a real Clipus video campaign from a SaaS URL (connected account)"
---

The user wants to create a real Clipus campaign for: **$ARGUMENTS**

1. Parse `$ARGUMENTS`: first token = URL (required); any following tokens like `en ja ko` = target languages (optional). If no URL, ask for one.
2. Call the `clipus_create_campaign` MCP tool with `{ url, languages? }`.
   - This call can take a few minutes — Clipus crawls the site synchronously. Tell the user it's preparing and wait.
   - If the tool returns an error message (Growth plan / invalid key / screenshot failure / monthly limit / timeout), relay it plainly and stop. For key/plan errors, point them to `/clipus:connect`.
3. On success you get a `campaign_id`. Immediately call `clipus_get_campaign` with it to show the initial status.
4. Offer to poll: tell the user they can run `/clipus:status <campaign_id>` to check progress and get the video file URLs when ready.
