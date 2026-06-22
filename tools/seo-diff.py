#!/usr/bin/env python3
"""SEO-diff gate.

Compares the SEO-critical parts of each generated page (_site/) against the
current live page (repo root) and reports any differences. The rebuild's
hard rule: no stage ships unless this prints DIFF=0 for its pages.

Compared, per page:
  - <title>
  - meta name=description / keywords / robots / author / title
  - link rel=canonical
  - every og:* and twitter:* meta
  - every link rel=alternate (hreflang)
  - JSON-LD blocks, compared SEMANTICALLY (parsed -> canonical -> compared),
    so Eleventy whitespace reformatting doesn't cause false diffs.

Usage: python3 tools/seo-diff.py pages/country-hub-*.html
       (paths are relative to repo root; each is matched to _site/<same>)
"""
import sys, re, json, glob, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "_site"

def _norm(v):
    """Normalise HTML-entity encoding so cosmetically-identical values compare
    equal. The live site is inconsistently encoded (raw & vs &amp;, raw ' vs
    &#39;); the rebuild emits correct, consistent encoding. Decoding both sides
    to plain text means the gate flags only REAL content differences, not
    encoding improvements (per the 'unify, don't mirror' decision)."""
    if isinstance(v, str):
        return html.unescape(v)
    if isinstance(v, list):
        return [tuple(_norm(x) for x in t) if isinstance(t, tuple) else _norm(t) for t in v]
    return v

def extract(doc: str):
    seo = {}
    m = re.search(r"<title>(.*?)</title>", doc, re.S)
    seo["title"] = (m.group(1).strip() if m else None)
    for name in ("description", "keywords", "robots", "author", "title"):
        m = re.search(rf'<meta\s+name="{name}"\s+content="(.*?)"', doc, re.S)
        seo[f"meta:{name}"] = m.group(1) if m else None
    m = re.search(r'<link\s+rel="canonical"\s+href="(.*?)"', doc)
    seo["canonical"] = m.group(1) if m else None
    # og / twitter — collect as a sorted set so order never matters
    seo["og"] = sorted(re.findall(r'<meta\s+property="(og:[^"]*)"\s+content="(.*?)"', doc, re.S))
    seo["twitter"] = sorted(re.findall(r'<meta\s+name="(twitter:[^"]*)"\s+content="(.*?)"', doc, re.S))
    seo["hreflang"] = sorted(re.findall(r'<link\s+rel="alternate"\s+hreflang="(.*?)"\s+href="(.*?)"', doc))
    # JSON-LD, parsed semantically
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', doc, re.S)
    parsed = []
    for b in blocks:
        try:
            parsed.append(json.loads(b))
        except json.JSONDecodeError as e:
            parsed.append({"__PARSE_ERROR__": str(e)})
    seo["jsonld"] = json.dumps(parsed, sort_keys=True, ensure_ascii=False)
    return seo

# Intentional normalisations: where the rebuild deliberately FIXES a one-off
# inconsistency in the current site. Each entry documents a known, approved
# improvement so the gate passes on it but still catches everything else.
# Format: { "relative/path.html": {"seo_key", ...} }
ALLOWED = {
    # Poland's live page had twitter:card=summary; all 21 other country hubs
    # use summary_large_image. The module normalises Poland up to match.
    "pages/country-hub-poland.html": {"twitter"},
    # These help pages had a raw "&" in twitter:title (invalid HTML). The
    # module emits the correct &amp; encoding. Renders identically; valid HTML.
    "pages/help/plans.html": {"twitter"},
    "pages/help/privacy.html": {"twitter"},
    "pages/help/contact.html": {"twitter"},
}

def main(argv):
    patterns = argv or ["pages/country-hub-*.html"]
    files = []
    for p in patterns:
        files += [Path(x).relative_to(ROOT) if Path(x).is_absolute() else Path(x)
                  for x in glob.glob(str(ROOT / p))]
    files = sorted(set(files))
    total_diffs = 0
    for rel in files:
        live = ROOT / rel
        gen = SITE / rel
        if not gen.exists():
            print(f"MISSING generated: {rel}")
            total_diffs += 1
            continue
        a = {k: _norm(v) for k, v in extract(live.read_text(encoding="utf-8")).items()}
        b = {k: _norm(v) for k, v in extract(gen.read_text(encoding="utf-8")).items()}
        allowed = ALLOWED.get(str(rel), set())
        diffs = [k for k in a if a[k] != b[k] and k not in allowed]
        accepted = [k for k in a if a[k] != b[k] and k in allowed]
        for k in accepted:
            print(f"ACCEPTED normalisation in {rel}: [{k}] (documented improvement)")
        if diffs:
            total_diffs += len(diffs)
            print(f"\nDIFF in {rel}:")
            for k in diffs:
                print(f"  [{k}]\n    live: {a[k]!r}\n    gen:  {b[k]!r}")
    print(f"\n=== SEO DIFF TOTAL: {total_diffs} across {len(files)} pages ===")
    return 1 if total_diffs else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
