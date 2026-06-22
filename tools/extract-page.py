#!/usr/bin/env python3
"""Convert a hand-written HTML page into a module-based Eleventy page file.

Extracts the per-page SEO from <head>, the body (between </nav> and <footer>),
the footer CTA zone (if present), and the trailing <script> tags, then writes
a src/<path>.njk file with front-matter + body that uses layouts/page.njk.

The output is verified by tools/seo-diff.py + the body-identity check; this
script only does the mechanical lift so we don't hand-transcribe.

Usage: python3 tools/extract-page.py pages/help/workflows.html
"""
import re, sys, json, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

def meta(doc, name, attr="name"):
    m = re.search(rf'<meta\s+{attr}="{re.escape(name)}"\s+content="(.*?)"', doc, re.S)
    # Decode HTML entities so values stored in front-matter are plain text;
    # Nunjucks re-escapes them exactly once on output (avoids &amp;amp;).
    return html.unescape(m.group(1)) if m else None

def link(doc, rel):
    m = re.search(rf'<link\s+rel="{rel}"\s+href="(.*?)"', doc)
    return m.group(1) if m else None

def convert(relpath: str):
    src = ROOT / relpath
    doc = src.read_text(encoding="utf-8")

    title = html.unescape(re.search(r"<title>(.*?)</title>", doc, re.S).group(1))
    seo = {
        "title": title,
        "description": meta(doc, "description"),
        "canonical": link(doc, "canonical"),
    }
    if meta(doc, "keywords"): seo["keywords"] = meta(doc, "keywords")
    author = meta(doc, "author")
    if author and author != "Philip Ross": seo["author"] = author
    # whether the live page emits an author meta at all (demo.html omits it)
    seo["hasAuthor"] = author is not None
    # robots: preserve a non-default directive (noindex/nofollow). Many pages
    # are deliberately de-indexed (internal, redirects, demo) — must not flip
    # them to index,follow.
    robots = meta(doc, "robots")
    if robots and robots != "index, follow": seo["robots"] = robots
    # whether the live page emits twitter:description at all
    seo["hasTwitterDesc"] = meta(doc, "twitter:description", "name") is not None
    # whether the live page emits any twitter / og tags at all
    seo["hasTwitter"] = meta(doc, "twitter:card", "name") is not None
    seo["hasOg"] = meta(doc, "og:type", "property") is not None
    tc = meta(doc, "twitter:card", "name")
    if tc and tc != "summary": seo["twitterCard"] = tc
    tt = meta(doc, "twitter:title", "name")
    if tt and tt != title: seo["twitterTitle"] = tt
    td = meta(doc, "twitter:description", "name")
    if td and td != seo["description"]: seo["twitterDescription"] = td
    ol = meta(doc, "og:locale", "property")
    if ol and ol != "en_GB": seo["ogLocale"] = ol
    ot = meta(doc, "og:type", "property")
    if ot and ot != "website": seo["ogType"] = ot
    ola = meta(doc, "og:locale:alternate", "property")
    if ola: seo["ogLocaleAlt"] = ola
    # does the live page actually emit <meta name="title">?
    seo["hasMetaTitle"] = meta(doc, "title", "name") is not None
    # og:title / og:description that differ from the page title/description
    ogt = meta(doc, "og:title", "property")
    if ogt and ogt != title: seo["ogTitle"] = ogt
    ogd = meta(doc, "og:description", "property")
    if ogd and ogd != seo["description"]: seo["ogDescription"] = ogd
    # hreflang
    hl = re.findall(r'<link\s+rel="alternate"\s+hreflang="(.*?)"\s+href="(.*?)"', doc)
    if hl:
        seo["hreflang"] = [{"lang": l, "href": h} for l, h in hl]
    # lang attr
    langm = re.search(r'<html\s+lang="(.*?)"', doc)
    lang = langm.group(1) if langm else "en"
    # jsonld (raw, first block)
    jm = re.search(r'<script type="application/ld\+json">(.*?)</script>', doc, re.S)
    jsonld = jm.group(1).strip() if jm else None
    # head <style> block (the per-page inline CSS, e.g. .help-shell). Captured
    # verbatim so output is byte-identical; scheduled for extraction into a
    # shared stylesheet in the later CSS-consolidation pass.
    headStyle = None
    head = doc.split("</head>", 1)[0]
    sm = re.search(r'<style>(.*?)</style>', head, re.S)
    if sm:
        headStyle = sm.group(1)
    # body class
    bm = re.search(r'<body[^>]*class="(.*?)"', doc)
    bodyClass = bm.group(1) if bm else "page-inner"
    # body content between </nav> and <footer>
    body = doc.split("</nav>", 1)[1].rsplit("<footer>", 1)[0].strip()
    # footer cta zone?
    footerCta = None
    fm = re.search(r'<div class="footer-cta-zone">(.*?)</div>\s*<div class="footer-rule">', doc, re.S)
    if fm:
        zone = fm.group(1)
        h = re.search(r'footer-cta-heading">(.*?)<', zone)
        s = re.search(r'footer-cta-sub">(.*?)</p>', zone, re.S)
        # Scope action links to ONLY the footer-cta-actions div, so a mailto
        # link inside the sub paragraph can't be mis-parsed as an action.
        actsdiv = re.search(r'<div class="footer-cta-actions">(.*?)</div>', zone, re.S)
        acts = re.findall(r'<a href="(.*?)" class="(.*?)"[^>]*>(.*?)</a>',
                          actsdiv.group(1) if actsdiv else "", re.S)
        footerCta = {
            "heading": h.group(1) if h else "",
            "sub": (s.group(1).strip() if s else ""),
            "actions": [{"href": a[0], "class": a[1], "label": a[2].strip()} for a in acts],
        }
    # trailing scripts (in body, before </body>)
    scripts = re.findall(r'<script src="(.*?)"></script>', doc)

    # Build front-matter as YAML-ish via JSON (Eleventy accepts JSON front-matter
    # with ---json fence, which avoids YAML quoting pitfalls).
    data = {"layout": "layouts/page.njk",
            "permalink": "/" + relpath,
            "bodyClass": bodyClass,
            "seo": {**seo, "lang": lang}}
    if jsonld: data["seo"]["jsonld"] = jsonld
    if headStyle: data["headStyle"] = headStyle
    if footerCta: data["footerCta"] = footerCta
    if scripts: data["scripts"] = scripts

    out = ROOT / "src" / relpath
    out = out.with_suffix(".njk")
    out.parent.mkdir(parents=True, exist_ok=True)
    fmblock = "---json\n" + json.dumps(data, indent=2, ensure_ascii=False) + "\n---\n"
    out.write_text(fmblock + body + "\n", encoding="utf-8")
    print(f"wrote {out.relative_to(ROOT)}")

if __name__ == "__main__":
    for p in sys.argv[1:]:
        convert(p)
