import { chromium } from 'playwright';

const urls = [
  'https://quickler.co/',
  'https://quickler.co/pages/services.html',
  'https://quickler.co/pages/privacy.html',
];

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });

for (const url of urls) {
  await p.goto(url, { waitUntil: 'networkidle' }).catch(() => {});
  await p.waitForTimeout(400);
  const read = async () => p.evaluate(() => {
    const nav = document.querySelector('nav');
    if (!nav) return { missing: true };
    const cs = getComputedStyle(nav);
    const r = nav.getBoundingClientRect();
    const sc = document.querySelector('.story-scroll');
    return {
      y: sc ? Math.round(sc.scrollTop) : Math.round(window.scrollY),
      scrolledClass: nav.classList.contains('nav-scrolled'),
      bg: cs.backgroundImage !== 'none' ? 'gradient/img' : cs.backgroundColor,
      display: cs.display, visibility: cs.visibility, opacity: cs.opacity,
      position: cs.position, top: Math.round(r.top), height: Math.round(r.height),
      width: Math.round(r.width),
    };
  });
  const before = await read();
  // scroll down
  await p.evaluate(() => {
    const sc = document.querySelector('.story-scroll');
    if (sc) sc.scrollTop = 1500; else window.scrollTo(0, 1500);
  });
  await p.waitForTimeout(500);
  const mid = await read();
  // back to top
  await p.evaluate(() => {
    const sc = document.querySelector('.story-scroll');
    if (sc) sc.scrollTop = 0; else window.scrollTo(0, 0);
  });
  await p.waitForTimeout(500);
  const back = await read();
  console.log('\n=== ' + url + ' ===');
  console.log('top0 :', JSON.stringify(before));
  console.log('mid  :', JSON.stringify(mid));
  console.log('back0:', JSON.stringify(back));
}
await b.close();
