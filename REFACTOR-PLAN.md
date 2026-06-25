# Full website refactor — plan (survives /compact)

The site is a reel-style scroller. `story.njk` is THE master template. One
change to it must restyle every page. This file is the source of truth for
the in-progress full refactor. Work ONLY in /home/balnagowan/quickler-site.
Never touch quickler-engine or quickler-dashboard.

## Locked decisions (from the user)
1. **Reel = shopfront, articles stay long.** Main nav pages (home, services,
   about, support, demo) use the reel. Long-form SEO articles/guides/country
   pages KEEP their long text (Google needs it) but get the new gradient nav
   + footer for consistency.
2. **Services SEO text goes BELOW the reel on the SAME URL.** Add an optional
   `seoBody` region to story.njk that renders full long-form HTML AFTER the
   reel panels, BEFORE the footer. Crawlable, doesn't break the panels.
   The old long-form services had **855 words**; the reel dropped ~600. They
   live in `f3ea7c8:src/pages/services.njk` (last good long-form). Restore
   that text into services' seoBody.
3. **Support topic cards: spread across panels** (not one cramped 8-card grid
   that overflows — see user screenshot). Split into 2-3 card panels.
4. **Contact form looks terrible: build our own clean one OR remove it.**
   Current form is the bespoke Formspree form (action f/mjknoeqd, 8 fields,
   anchor #contact-form-section, data-agent-* hooks). User leans remove/replace.
5. **Demo QR is BLANK/BROKEN** — no JS generates the QR, no WhatsApp number
   wired. NEEDS the WhatsApp number/link from the user. Until then it's dead.
   qrcodejs lib is loaded; #qr-canvas and #wa-link exist but nothing populates.
6. **Nav clips/half-loads on #anchor links** (services.html#pricing) because
   native anchor jump fights the scroll-snap container. FIX: JS that scrolls
   the .story-scroll container to the target panel instead of native jump.
7. **Nav: pill at rest (scrollTop 0), full-width bar once scrolling begins.**
   Already implemented (nav-compact.js adds .nav-scrolled at y>24, removes at
   y<8; .nav-scrolled goes full-width/top:0/radius:0). VERIFY it's right.
8. **White edge bars** (top+bottom) were a FIREFOX bug: 100svh resolves
   shorter than viewport. FIXED with 100dvh on .story-scroll + body.page-story
   AND html:has(body.page-story){background:var(--brand-gradient)}. User's
   Firefox is the only place this shows — headless can't reproduce. Deployed
   v237. CONFIRM with user it's actually gone.

## The template architecture (the real fix)
story.njk renders: nav (fixed pill->bar) -> main.story-scroll { hero panel +
blocks[] panels + footer panel }. Each .story = 100% height, snap, <=100 words.
Reveal-on-scroll was REMOVED from panels (its translateY shifted them and
caused edge gaps). Panels are solid full-bleed.

ADD: optional `seoBody` front-matter (raw HTML string). Render it as a
NON-snap long-form section after the footer panel (or before it), styled as
normal article text, so reel pages can carry full SEO text. This is what makes
reel + SEO coexist on one URL.

block types in story.njk: prose, split, steps, cards, tags, cta, video, raw.
Alternating colour rhythm: hero white, then odd loop.index -> gradient
(story-feature), even -> white. feature/alt/plain override.

## Pages + their nav targets
- Home / -> src/index.njk (the reference reel)
- Workflows + Pricing -> /pages/services.html -> src/pages/services.njk
- About -> /pages/about.html -> src/pages/about.njk
- Support -> /pages/help/index.html -> src/pages/help/index.njk
- Try on WhatsApp -> /pages/demo.html -> src/pages/demo.njk
- Login -> external app.quickler.co/login -> LEAVE ALONE
All 4 converted pages already use layout: layouts/story.njk + bodyClass
page-story. ~155 OTHER pages (guides, country, comparisons) still use
layouts/page.njk and are long-form SEO — these get nav+footer consistency,
NOT reel conversion.

## Build / verify / deploy
- Build: `npx @11ty/eleventy` (run from quickler-site). Minifies CSS on build.
- Gates: `python3 tools/contrast-gate.py` (15 pairings AA) and
  `../quickler-venv/bin/python tools/seo-diff.py` (must be 0).
- Screenshot tool pattern: a tiny node http server over _site + Playwright
  chrome-headless-shell at
  /home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell
  with LD_LIBRARY_PATH=~/.cache/chrome-libs. pngjs available for pixel reads.
  HEADLESS IS CHROME — cannot see the Firefox-only white-bar; trust user there.
- Deploy: bump version in src/_data/site.json, build, git commit + push to
  main (GitHub Action builds + deploys to quickler.co). Confirm with
  `gh run watch <id>` then curl the live 'site version'.
- CURRENT VERSION: 239 (next deploy = 240).

## Order of work
1. story.njk: add seoBody region (template foundation).
2. Fix anchor-nav in reel-nav.js (scroll container to #target panel).
3. services.njk: restore 855-word SEO text into seoBody (from f3ea7c8).
4. support: spread cards across panels; replace/remove contact form.
5. demo: wire QR + wa-link (BLOCKED on user's WhatsApp number).
6. long-form pages: ensure new nav+footer (they already include partials via
   page.njk -> check nav.njk/footer.njk are shared and current).
7. Build, gates, multi-device verify, deploy. Confirm white-bar gone w/ user.

## Later additions (from user, post-plan)
9. **Video keeps playing when scrolled off.** Currently the YouTube iframe
   pauses/stops when its panel leaves view. Make the template (every page)
   keep the walkthrough video playing as you scroll past it. Options: use the
   YouTube IFrame API and don't destroy it, or a persistent mini-player. Apply
   in story.njk so it works everywhere there's a `video` block.
10. **Content optimised for engagement-while-scrolling AND actually making
    the point.** Each reel panel should hook + land its message as you flick
    through — punchy, concrete, benefit-led, not filler. Review copy per panel
    against: does a scroller get the point in 2 seconds? Apply across pages.

## Known traps
- The Bash cwd sometimes resets to /home/balnagowan/quickler-engine — ALWAYS
  cd /home/balnagowan/quickler-site first in every Bash call.
- Front-matter is `---json` ... `---`. JSON must be valid: escape quotes in
  raw/html strings, no trailing commas. Big jsonld blocks live in seo.jsonld.
- npm i can wipe node_modules/playwright — reinstall with
  `npm i playwright pngjs --no-save` if a tool errors ERR_MODULE_NOT_FOUND.
