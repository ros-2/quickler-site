# Homepage clean-rebuild plan (the gauntlet)

A full structural rewrite of the homepage, written fresh (no leftover
.page-body / .page-dark-hero / inline scripts). Once dialled in, this
becomes THE template (story.njk) rolled across all 163 pages.

## Marketing flow (confirmed) — one idea per screen, scroll to reveal next
Customer questions answered in order as they scroll:
1. WHAT IS THIS?  — hero: "Field compliance, done on WhatsApp." + one line + Try the demo
2. THE PROBLEM    — paperwork waits until you get home
3. THE SHIFT      — the messages just become the report
4. HOW (with VIDEO) — 3 steps; the walkthrough VIDEO lives INSIDE this section
5. WHERE / USES   — EICR, gas, van checks, site inspections (brief, not a directory)
6. ACT            — single demo CTA: "Try it on WhatsApp in two minutes"
(quiet SEO fine-print above footer, no full screen)

## Confirmed design rules
- ONE item per screen: each .story section ~88vh desktop; on <=760px min-height drops.
- Scroll-reveal RE-TRIGGERS up AND down (toggle, not unobserve) — js/scroll-reveal.js (done).
- Colours = LOGO colours only: --blue #2f6bff (fills/buttons), --blue-text #1f54e0 (small text/AA), --pink #f43f8c. Gradient = logo gradient.
- Top nav = logo GRADIENT bar with WHITE wordmark (user likes it — keep).
- Photos: NOT ready yet. Plan for future photos as section BACKGROUNDS or borders (user idea). For now NO dominant placeholders.
- Device-agnostic: clamp() everything + 760px stack. Verified phone+desktop earlier.
- Marketing lens: "What is this? What do I do? Where can I use it?"

## Open bugs the rewrite must kill
- Empty 'Get started' nav pill (white-on-white text). Two competing .nav-cta-pill rules (~L3850 and ~L5067 in styles.v2.css).
- Random dark navy bar on left edge = old .page-dark-hero/.page-body bg bleed. FIX: body class page-story, remove .page-body wrapper (started).
- Hero too crammed (headline+sub+button+video at once). Per decision, video moves to How section.
- Old inline reveal script still in index.njk <script> block — delete (shared scroll-reveal.js replaces it).

## Template mechanics
- story.njk master layout already drafted at src/_includes/layouts/story.njk (hero + blocks[]: prose/split/steps/cards/tags/raw + footerCta).
- Homepage should be rebuilt to USE story.njk (data-driven front-matter), proving the template, THEN roll to other pages.

## State / deploy notes
- site.json version bumping each deploy for cache-bust (currently ~220). Append ?v in head.njk.
- Deploy: git push -> GitHub Action. GitHub Pages deploy step has timed out intermittently (infra, not code) — re-run failed runs.
- Screenshots: LD_LIBRARY_PATH=~/.cache/chrome-libs node tools/shot1.mjs (chrome-headless-shell + extracted libs in ~/.cache/chrome-libs, persistent).
- Gates: python3 tools/contrast-gate.py ; ../quickler-venv/bin/python tools/seo-diff.py (must stay 0).

## CSS note
The .story system lives at the END of css/styles.v2.css. The OLD inner-page
styles (.inner-hero, .page-shell, .card-link, .section-tight, .page-body,
.page-dark-hero) are legacy — being superseded. Don't keep feeding them.
