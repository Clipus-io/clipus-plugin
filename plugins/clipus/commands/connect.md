---
description: "Connect your Clipus account so you can render real campaigns"
---

Help the user connect Clipus for the connected-tier commands (`/clipus:campaign`, `/clipus:status`).

Explain and guide, step by step:

1. **Plan requirement:** Clipus API access requires a **Growth plan or above**. If they're on Free/Starter, point them to https://clipus.io/pricing — the API key will return `403` otherwise.
2. **Create a key:** In the Clipus dashboard, go to **Settings → API Keys** and create a key. It looks like `sk_live_...`. It's shown only once — copy it.
3. **Set the env var.** The MCP server reads `CLIPUS_API_KEY`. Offer to add it for them, but DO NOT print the key back or commit it. Suggest one of:
   - Shell profile (persists everywhere): add `export CLIPUS_API_KEY="sk_live_..."` to `~/.zshrc`, then restart the shell.
   - Project `.env` (if their MCP client loads it).
   Ask the user to paste/set the key themselves; never echo it into logs.
4. **Verify format:** confirm the value starts with `sk_live_`. Do not call the API just to test — the first real `/clipus:campaign` will surface a clear `401` (bad key) or `403` (plan) message if something's wrong.
5. Tell them they're ready: `/clipus:campaign <url>` to create a real campaign.
