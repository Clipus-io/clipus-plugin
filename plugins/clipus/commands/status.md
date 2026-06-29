---
description: "Check a Clipus campaign's status and download URLs (connected account)"
---

The user wants the status of campaign: **$ARGUMENTS**

1. Treat `$ARGUMENTS` as the `campaign_id`. If empty, ask for it (it was printed by `/clipus:campaign`).
2. Call the `clipus_get_campaign` MCP tool with `{ campaign_id }`.
3. Summarize for the user: overall `status`, the `languages`, and for each video its `platform`, `status`, and `fileUrl` (download link) when present.
4. If an error comes back (e.g. invalid key → `/clipus:connect`, or not found → recheck the id), relay it plainly.
