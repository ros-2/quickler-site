import { chromium } from "playwright";
import http from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { extname, join } from "node:path";

const ROOT = new URL("../_site/", import.meta.url).pathname;
const TYPES = { ".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json",".webmanifest":"application/json" };
const server = http.createServer(async (req,res)=>{ try{ let p=decodeURIComponent(req.url.split("?")[0]); if(p.endsWith("/"))p+="index.html"; let f=join(ROOT,p); if(!existsSync(f)&&existsSync(f+".html"))f+=".html"; const b=await readFile(f); res.writeHead(200,{"content-type":TYPES[extname(f)]||"application/octet-stream"}); res.end(b);}catch{res.writeHead(404);res.end("404");}});
await new Promise(r=>server.listen(4322,r));
const base="http://localhost:4322";
const pages = process.argv.slice(2);
const browser = await chromium.launch();
for (const path of pages) {
  const name = path.replace(/[\/]/g,"_").replace(".html","");
  const ctx = await browser.newContext({ viewport:{width:1440,height:1000}, deviceScaleFactor:1 });
  const page = await ctx.newPage();
  await page.goto(base+"/"+path,{waitUntil:"networkidle",timeout:15000}).catch(()=>{});
  await page.waitForTimeout(800);
  await page.screenshot({ path:`tools/shots/sc-${name}.png`, fullPage:true });
  await ctx.close();
  console.log("shot",name);
}
await browser.close(); server.close(); console.log("done");
