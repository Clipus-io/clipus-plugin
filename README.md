# Clipus — Claude Code Plugin

Autonomous Marketing Agent for SaaS, in your terminal. Analyze a product site and generate shortform video scripts, landing copy, and real rendered video campaigns.

## Install
```
/plugin marketplace add Clipus-io/clipus-plugin
/plugin install clipus
```

## Free (no account)
- `/clipus:surface <url>` — generate a Surface report for any SaaS site (needs an email for delivery).
- `/clipus:hook <url>` — shortform video hooks + a ≤100-word script, grounded in the real product.
- `/clipus:copy [context]` — landing/marketing copy.
- Agent `gtm-strategist` — GTM angle analysis before scripting.

## Connected (Clipus Growth plan + API key)
- `/clipus:connect` — set up your `sk_live_` API key.
- `/clipus:campaign <url> [langs]` — render a real multilingual campaign.
- `/clipus:status <campaign_id>` — check progress and get video download URLs.

API access requires a Clipus **Growth plan or above**. Create a key in Settings → API Keys. Set `CLIPUS_API_KEY` in your environment (the plugin's MCP server reads it). Never commit your key.
