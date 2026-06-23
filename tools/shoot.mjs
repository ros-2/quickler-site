// Render key page types from _site at desktop + mobile, save PNGs to tools/shots/.
// Pure local: serves _site over a tiny static server, no network needed.
import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";

const ROOT = new URL("../_site/", import.meta.url).pathname;
const TYPES = {
  ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/json",
};

const server = http.createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";
    let file = join(ROOT, p);
    if (!existsSync(file) && existsSync(file + ".html")) file += ".html";
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404); res.end("404");
  }
});

await new Promise((r) => server.listen(4321, r));
const base = "http://localhost:4321";

const pages = [
  ["home", "/"],
  ["services", "/pages/services.html"],
  ["country-hub", "/pages/country-hub-italy.html"],
  ["article", "/pages/data-privacy-france.html"],
  ["help", "/pages/help/workflows.html"],
  ["demo", "/pages/demo.html"],
];

const browser = await chromium.launch();
for (const [name, path] of pages) {
  for (const [vp, w, h] of [["desktop", 1440, 1000], ["mobile", 390, 844]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(400);
    await page.screenshot({ path: `tools/shots/${name}-${vp}.png`, fullPage: vp === "desktop" });
    await ctx.close();
  }
  console.log("shot", name);
}
await browser.close();
server.close();
console.log("done");
