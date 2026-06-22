#!/usr/bin/env python3
"""Body-identity check: generated (_site/) vs live (repo root).

Normalises away differences that are cosmetic or are DOCUMENTED, APPROVED
improvements, then reports any remaining real difference. Complements
seo-diff.py (which only checks head SEO fields).

Approved/cosmetic normalisations applied to BOTH sides before comparing:
  - whitespace between/inside tags (invisible to browsers)
  - the site-version stamp line (expected to differ)
  - &amp; vs & (generated emits correct &amp;; renders identically)
  - the country-hub kicker class unification (card-kicker/kicker ->
    card-link-kicker) — approved by Philip to fix unstyled labels
  - country-hub viewport/font unification (initial-scale=1 -> 1.0,
    older font-weight list -> 300..700) — unifying two live sub-variants

Usage: python3 tools/body-diff.py 'pages/help/*.html'
"""
import sys, re, glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "_site"

def normalise(s: str) -> str:
    s = re.sub(r'<div class="site-version".*?</div>', '', s, flags=re.S)
    # approved unifications
    s = s.replace("card-link-kicker", "KICK").replace("card-kicker", "KICK")
    s = re.sub(r'class="kicker"', 'class="KICK"', s)
    s = s.replace("initial-scale=1.0", "IS").replace("initial-scale=1", "IS")
    s = s.replace("wght@300..700", "WGHT").replace("wght@400;500;600;700", "WGHT")
    s = s.replace("wght@300;400;500;600;700", "WGHT")
    # cosmetic
    s = s.replace("&amp;", "&")
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r">\s+<", "><", s)
    return s.strip()

def main(argv):
    patterns = argv or ["pages/help/*.html"]
    files = sorted({Path(x).relative_to(ROOT) for p in patterns
                    for x in glob.glob(str(ROOT / p))})
    bad = 0
    for rel in files:
        live = (ROOT / rel)
        gen = (SITE / rel)
        if not gen.exists():
            print(f"  MISSING: {rel}"); bad += 1; continue
        a = normalise(live.read_text(encoding="utf-8"))
        b = normalise(gen.read_text(encoding="utf-8"))
        if a != b:
            bad += 1
            # show first divergence
            for i, (x, y) in enumerate(zip(a.split(), b.split())):
                if x != y:
                    ctx = " ".join(a.split()[max(0, i-3):i+3])
                    print(f"  DIFF {rel}: ...{ctx}...")
                    print(f"        live: {x!r}  gen: {y!r}")
                    break
            else:
                print(f"  DIFF {rel}: length mismatch (live {len(a.split())} vs gen {len(b.split())} words)")
    print(f"=== BODY: {len(files)-bad}/{len(files)} content-identical ===")
    return 1 if bad else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
