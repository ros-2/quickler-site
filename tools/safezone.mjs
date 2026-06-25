import { chromium } from "playwright";
const EXE="/home/balnagowan/.cache/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-linux64/chrome-headless-shell";
const b=await chromium.launch({executablePath:EXE,args:["--no-sandbox","--disable-gpu"]});
for (const path of ["/","/pages/services.html","/pages/pricing.html","/pages/about.html"]) {
  const pg=await b.newPage({viewport:{width:1280,height:760}});
  await pg.goto("https://quickler.co"+path+"?z=247",{waitUntil:"networkidle"});
  await pg.waitForTimeout(700);
  const d=await pg.evaluate(()=>{
    const nav=document.querySelector('nav').getBoundingClientRect();
    const navBottom=nav.bottom;
    // arrow band: bottom ~38px + 46px tall => top edge of arrow zone
    const arrowTop=window.innerHeight-90;
    // first panel's content box
    const inner=document.querySelector('.story-hero .story-inner')||document.querySelector('.story-hero');
    const r=inner.getBoundingClientRect();
    return {
      navBottom:Math.round(navBottom),
      contentTop:Math.round(r.top),
      contentBottom:Math.round(r.bottom),
      arrowZoneTop:Math.round(arrowTop),
      clearsNav: r.top > navBottom,
      clearsArrow: r.bottom < arrowTop
    };
  });
  console.log(path, "navBottom="+d.navBottom, "contentTop="+d.contentTop, "contentBottom="+d.contentBottom, "arrowZone="+d.arrowZoneTop,
    "| nav:"+(d.clearsNav?"CLEAR":"OVERLAP"), "arrow:"+(d.clearsArrow?"CLEAR":"OVERLAP"));
  await pg.close();
}
await b.close();
