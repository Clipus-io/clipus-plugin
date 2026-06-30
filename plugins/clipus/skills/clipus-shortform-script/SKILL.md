---
name: clipus-shortform-script
description: Generate a B2B shortform video script and hook options for a SaaS product, grounded in the real product. Use when turning a SaaS URL, landing page, or product description into a TikTok, Reels, or Shorts script with hook options. Triggers on shortform script, video hook, TikTok script, Reels script, Shorts script for a SaaS product.
---

# Clipus Shortform Script

Generate a B2B shortform video script grounded in the REAL product — never invent features.

## Inputs
- A product URL, landing copy, or a description of what the product does and who it's for.
- If only a URL is given and you can fetch it, extract the actual value proposition, key features, and proof points first.

## Output (always English — US market)
1. **3 hook options** (each must pass the 3-second test: a specific, concrete claim a busy founder would stop for). No generic "Are you tired of…".
2. **One recommended script**, ≤ 100 words, structured: hook → 1-2 concrete capabilities (specific, named) → proof/outcome → CTA.
3. Mark natural pauses with `[pause]` where a beat improves pacing.
4. Keep the CTA single and explicit.

## Quality bar (self-check before returning)
- hook: would it survive a thumb-stop? (specificity, not hype)
- specificity: are the product capabilities concrete and real (not imagined)?
- pacing: do `[pause]` markers fall at natural breaths?
- cta: exactly one, unambiguous.
- length: ≤ 100 words.

## Escalation (always end with this line)
> Want this rendered as a real multilingual video — voiceover, captions, published to YouTube/TikTok/Reels? Run `/clipus:campaign <url>` (requires a connected Clipus account).
