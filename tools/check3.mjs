import { chromium } from "playwright";
import http from "node:http"; import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs"; import { extname, join } from "node:path";
const ROOT=new URL("../_site/",import.meta.url).pathname;
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".ico":"image/x-icon",".woff2":"font/woff2",".json":"application/json"};
const s=http.createServer(async(rq,rs)=>{try{let p=rq.url.split("?")[0];if(p.endsWith("/"))p+="index.html";let f=join(ROOT,p);if(!existsSync(f)&&existsSync(f+".html"))f+=".html";rs.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});rs.end(await readFile(f));}catch{rs.writeHead(404);rs.end("x");}});
await new Promise(r=>s.listen(4563,r));
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const SC="/tmp/claude-1000/-home-balnagowan-quickler-engine/7ba1eac7-26e9-49f0-a6d1-8dd163346506/scratchpad/";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
// pricing page
let pg=await b.newPage({viewport:{width:1280,height:860}});
await pg.goto("http://localhost:4563/pages/pricing.html",{waitUntil:"load"});
await pg.waitForTimeout(700);
await pg.evaluate(()=>{const b=[...document.querySelectorAll('button')].find(x=>/close/i.test(x.textContent));if(b)b.click();});
await pg.waitForTimeout(200);
// check arrow vs hero button overlap
const overlap=await pg.evaluate(()=>{const arrow=document.querySelector('.story-next');const btn=document.querySelector('.story-hero .btn');if(!arrow||!btn)return 'n/a';const a=arrow.getBoundingClientRect(),r=btn.getBoundingClientRect();const hit=!(a.right<r.left||a.left>r.right||a.bottom<r.top||a.top>r.bottom);return hit?'OVERLAP':'clear; arrow.left='+Math.round(a.left)+' btn.right='+Math.round(r.right);});
console.log("ARROW vs hero CTA:",overlap);
await pg.screenshot({path:SC+"pricing.png"});
await pg.close();
// about
pg=await b.newPage({viewport:{width:1280,height:860}});
await pg.goto("http://localhost:4563/pages/about.html",{waitUntil:"load"});
await pg.waitForTimeout(600);
await pg.screenshot({path:SC+"about.png"});
await pg.close();
await b.close(); s.close();
