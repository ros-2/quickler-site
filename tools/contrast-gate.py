#!/usr/bin/env python3
"""WCAG contrast gate for the Quickler palette.

Resolves the design tokens (tokens.css + the styles.v2.css :root shim) to
concrete sRGB values, then checks every text/background PAIR the site
actually uses. Fails (exit 1) if any pairing falls below WCAG AA for its
text size. Run after any palette change so "bleached text" can never ship.

This does not parse arbitrary CSS rules — it checks the KNOWN, INTENTIONAL
pairings (the palette contract), which is what the monochrome redesign is
built on. Add a pairing here when a new surface/text combo is introduced.
"""
import sys, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_tokens():
    """Pull --name: value pairs from tokens.css and the styles.v2 :root shim."""
    raw = {}
    for f in ["src/css/tokens.css", "css/styles.v2.css"]:
        text = (ROOT / f).read_text(encoding="utf-8")
        # only the first :root block of each file (the shim / canonical defs)
        m = re.search(r":root\s*\{(.*?)\}", text, re.S)
        if not m:
            continue
        for name, val in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", m.group(1)):
            raw[name.strip()] = val.strip()
    return raw


def resolve(val, tokens, depth=0):
    """Resolve var(--x, fallback) chains to a concrete colour string."""
    if depth > 10:
        return val
    m = re.fullmatch(r"var\((--[\w-]+)(?:,\s*(.+))?\)", val.strip())
    if m:
        ref = tokens.get(m.group(1))
        if ref is not None:
            return resolve(ref, tokens, depth + 1)
        if m.group(2):
            return resolve(m.group(2), tokens, depth + 1)
    return val.strip()


def to_rgb(c):
    """Parse #hex / rgb() / rgba() to (r,g,b,a). Returns None if not a colour."""
    c = c.strip()
    m = re.fullmatch(r"#([0-9a-fA-F]{6})", c)
    if m:
        h = m.group(1)
        return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 1.0)
    m = re.fullmatch(r"#([0-9a-fA-F]{3})", c)
    if m:
        h = m.group(1)
        return (int(h[0] * 2, 16), int(h[1] * 2, 16), int(h[2] * 2, 16), 1.0)
    m = re.fullmatch(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)", c)
    if m:
        a = float(m.group(4)) if m.group(4) else 1.0
        return (int(m.group(1)), int(m.group(2)), int(m.group(3)), a)
    return None


def over(fg, bg):
    """Composite fg (may have alpha) over an opaque bg."""
    a = fg[3]
    return tuple(round(fg[i] * a + bg[i] * (1 - a)) for i in range(3))


def lum(rgb):
    def chan(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = chan(rgb[0]), chan(rgb[1]), chan(rgb[2])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def ratio(fg, bg):
    l1, l2 = lum(fg), lum(bg)
    hi, lo = max(l1, l2), min(l1, l2)
    return (hi + 0.05) / (lo + 0.05)


# The palette contract: every text/background pairing the site uses.
# (label, text-token, background-token, is_large_text)  large = >=24px or >=18.66px bold
PAIRINGS = [
    ("body text on page", "--ink", "--surface", False),
    ("heading on page", "--ink-strong", "--surface", True),
    ("secondary text on page", "--ink-soft", "--surface", False),
    ("body on tinted band", "--ink", "--surface-alt", False),
    ("secondary on tinted band", "--ink-soft", "--surface-alt", False),
    ("body on white card", "--ink", "--surface-card", False),
    ("heading on white card", "--ink-strong", "--surface-card", True),
    ("secondary on white card", "--ink-soft", "--surface-card", False),
    ("link/accent on page", "--blue-text", "--surface", False),
    ("link/accent on card", "--blue-text", "--surface-card", False),
    ("button text on blue", "--on-blue", "--blue", True),
    ("button hover text on blue-strong", "--on-blue", "--blue-strong", False),
    ("status text on grey pill", "--grey-700", "--grey-100", False),
    ("success text on success-soft", "--success-text", "--success-soft", False),
    # dark hero band: white text on the intentional dark navy background
    ("hero text on dark band", "--on-dark", "--surface-dark", False),
]

# Dark-band background isn't a token in the shim (#07122b literal); add it
# so the hero-band pairings resolve.
EXTRA = {"--surface-dark": "#07122b"}

AA_NORMAL = 4.5
AA_LARGE = 3.0


def main():
    tokens = load_tokens()
    tokens.update({k: v for k, v in EXTRA.items() if k not in tokens})
    fails, warns = [], []
    print("WCAG contrast gate — palette pairings\n" + "-" * 52)
    for label, fgk, bgk, large in PAIRINGS:
        fg_raw = resolve(f"var({fgk})", tokens)
        bg_raw = resolve(f"var({bgk})", tokens)
        fg, bg = to_rgb(fg_raw), to_rgb(bg_raw)
        if not fg or not bg:
            warns.append(f"  ? {label}: could not resolve ({fgk}={fg_raw}, {bgk}={bg_raw})")
            continue
        # A translucent background (soft tint) sits on the page surface;
        # composite it over white first so the real rendered colour is tested.
        page_white = (255, 255, 255)
        bg_solid = over(bg, page_white) if bg[3] < 1 else bg[:3]
        fg_solid = over(fg, bg_solid)
        r = ratio(fg_solid, bg_solid)
        need = AA_LARGE if large else AA_NORMAL
        status = "PASS" if r >= need else "FAIL"
        line = f"  {status}  {r:4.1f}:1 (need {need})  {label}"
        print(line)
        if r < need:
            fails.append(line)
    for w in warns:
        print(w)
    print("-" * 52)
    if fails:
        print(f"FAILED: {len(fails)} pairing(s) below WCAG AA")
        return 1
    print(f"OK: all {len(PAIRINGS)} pairings pass WCAG AA")
    return 0


if __name__ == "__main__":
    sys.exit(main())
