import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4562,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const SC="/tmp/claude-1000/-home-balnagowan-quickler-engine/7ba1eac7-26e9-49f0-a6d1-8dd163346506/scratchpad/";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});

// 1) services anchor: click "See pricing" -> should scroll to pricing panel
let pg=await b.newPage({viewport:{width:1280,height:900}});
await pg.goto("http://localhost:4562/pages/services.html",{waitUntil:"load"});
await pg.waitForTimeout(500);
const before=await pg.evaluate(()=>document.querySelector(".story-scroll").scrollTop);
await pg.evaluate(()=>{const a=[...document.querySelectorAll('a')].find(x=>x.getAttribute('href')==='#pricing');if(a)a.click();});
await pg.waitForTimeout(900);
const after=await pg.evaluate(()=>document.querySelector(".story-scroll").scrollTop);
console.log("ANCHOR #pricing: scrollTop",before,"->",after,after>before?"MOVED ✓":"DID NOT MOVE ✗");
await pg.close();

// 2) support page screenshot (cards + form)
pg=await b.newPage({viewport:{width:1280,height:900}});
await pg.goto("http://localhost:4562/pages/help/index.html",{waitUntil:"load"});
await pg.waitForTimeout(500);
// scroll to the contact form panel
await pg.evaluate(()=>{const f=document.querySelector('.contact-clean');if(f)f.closest('.story').scrollIntoView();});
await pg.waitForTimeout(700);
await pg.screenshot({path:SC+"support-form.png"});
await pg.close();

// 3) demo QR present
pg=await b.newPage({viewport:{width:1100,height:900}});
await pg.goto("http://localhost:4562/pages/demo.html",{waitUntil:"load"});
await pg.waitForTimeout(900);
const qr=await pg.evaluate(()=>!!document.querySelector("#qr-canvas canvas, #qr-canvas img"));
console.log("DEMO QR drawn:",qr?"✓":"✗");
await pg.close();

await b.close(); s.close();
