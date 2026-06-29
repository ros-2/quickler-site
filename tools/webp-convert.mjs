// One-off: convert all raster photos in assets/photos to WebP siblings.
// Backgrounds are referenced by bgImage in front-matter; a follow-up sed
// repoints those .jpg/.jpeg/.png refs to .webp. Originals are kept on disk
// as a fallback and for any non-WebP need. WebP is supported by ~97% of
// browsers; panels degrade to the scrim colour on the rest (no broken image).
import sharp from "sharp";
import { readdirSync, statSync } from "fs";
import { join, extname } from "path";

const ROOT = "assets/photos";
const QUALITY = 80; // visually lossless behind a scrim; ~half the bytes

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (/\.(jpe?g|png)$/i.test(name)) out.push(p);
  }
  return out;
}

const files = walk(ROOT);
let before = 0, after = 0;
for (const f of files) {
  const webp = f.replace(/\.(jpe?g|png)$/i, ".webp");
  const inBytes = statSync(f).size;
  await sharp(f).webp({ quality: QUALITY }).toFile(webp);
  const outBytes = statSync(webp).size;
  before += inBytes;
  after += outBytes;
  console.log(
    `${f} -> ${webp}  ${(inBytes / 1024).toFixed(0)}KB -> ${(outBytes / 1024).toFixed(0)}KB`
  );
}
console.log(
  `\nTOTAL: ${(before / 1048576).toFixed(2)}MB -> ${(after / 1048576).toFixed(2)}MB ` +
  `(${(100 - (after / before) * 100).toFixed(0)}% smaller across ${files.length} files)`
);
