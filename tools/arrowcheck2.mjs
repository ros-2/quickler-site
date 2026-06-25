import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4573,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const h of [1015, 900, 820, 760, 700]) {
  const pg=await b.newPage({viewport:{width:1912,height:h}});
  await pg.goto("http://localhost:4573/",{waitUntil:"load"});
  await pg.waitForTimeout(500);
  const d=await pg.evaluate(()=>{
    const arrow=document.querySelector('.story-next');
    const a=arrow.getBoundingClientRect();
    const btn=document.querySelector('.story-hero .btn');
    const r=btn.getBoundingClientRect();
    return {hidden:arrow.classList.contains('is-hidden'),gap:Math.round(a.top-r.bottom),overlap:!(a.top>r.bottom||a.bottom<r.top)};
  });
  console.log("vh="+h, "gap(arrow.top - btn.bottom)="+d.gap, d.overlap?"OVERLAP":"clear", d.hidden?"(arrow hidden)":"");
  await pg.close();
}
await b.close(); s.close();
