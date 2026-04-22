# quickler-site

Static marketing site for Quickler Ltd, hosted on GitHub Pages at
[quickler.co](https://quickler.co/). Vanilla HTML, CSS, JavaScript. No
framework, no build step, no runtime.

## Why it is static

Two reasons. First, cost and availability: GitHub Pages with a CNAME is
free and more reliable than anything we could host ourselves. Second,
blast radius: the marketing site has nothing sensitive in it, so the
cheapest and safest answer is the one that cannot be compromised at
runtime. The actual product lives at `reports.quickler.co` and is
`quickler-dashboard`.

## Structure

```
index.html                    homepage
pages/                        about, contact, faq, process, projects,
                              services, testimonials, case-studies
css/styles.css                single stylesheet, CSS variables + Grid
js/                           contact form + mobile nav, no framework
assets/icons/                 favicons and PWA icons
docs/llms.txt                 structured content for LLM crawlers
sitemap.xml, robots.txt       SEO plumbing
CNAME                         custom domain binding
```

## Non-obvious bits a reviewer might ask about

**GA4 stream ID is pinned per domain.** `G-L0G13C0E52` is the
`quickler.co` stream. Do not reuse the older Lochross stream ID; the
data stream shows as inactive if the tag and stream do not match.
Written down here because the mistake has been made once.

**`docs/llms.txt` is intentional.** LLM crawlers pick it up and use it
to answer questions about Quickler. Keep it factual and legally
accurate; it is effectively a press release being indexed at a higher
weight than the pages themselves. Cheaper than an SEO specialist.

**Contact form uses Formspree.** One third-party dependency, chosen
because it handles spam, CAPTCHA, and delivery without a backend. The
tradeoff is that Formspree outages mean contact form outages. Low
consequence given the volume; fine for now.

**No analytics on conversion steps.** GA4 tracks pageviews but the
actual funnel (signup, onboarding, first workflow run) lives in the
dashboard app and is tracked there, not here. Do not bloat the
marketing site with analytics for product metrics.

## Deploy

Push to `main`. GitHub Pages auto-deploys. There is no preview
environment; changes land on `quickler.co` within a minute or two of
the push. If that becomes a problem, move to a PR-preview provider,
not to a self-hosted pipeline.

## What stays in root

GitHub Pages and search engines expect these at the domain root. Do not
move them:

- `index.html`
- `robots.txt`
- `sitemap.xml`
- `CNAME`
- `site.webmanifest`
- `googlea7057464435666a5.html` (Google Search Console verification)

## License

Copyright 2026 Quickler Ltd. All rights reserved.
