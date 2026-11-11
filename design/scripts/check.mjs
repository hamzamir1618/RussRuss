// Drive the RussRuss dev build in Edge: desktop jumps into every pinned section, phone, and reduced motion.
//   npm i --no-save puppeteer-core@23        (once; --no-save keeps it out of package.json)
//   npx vite --port 5181                      (in another terminal)
//   node design/scripts/check.mjs [url] [outDir] [all|desktop|phone|rm]
// Screenshots go to <temp>/russruss-shots unless outDir is given. Prints console errors and warnings at the end.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const URL = process.argv[2] || 'http://localhost:5181/';
const OUT = process.argv[3] || path.join(os.tmpdir(), 'russruss-shots');
const ONLY = process.argv[4] || 'all';
fs.mkdirSync(OUT, { recursive: true });
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];

async function open(browser, view, opts = {}) {
  const page = await browser.newPage();
  await page.setViewport(view);
  if (opts.rm) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${opts.tag}] ${m.type()}: ${m.text()}`); });
  page.on('pageerror', e => errors.push(`[${opts.tag}] pageerror: ${e.message}`));
  await page.goto(URL, { waitUntil: 'networkidle0' });
  await sleep(opts.rm ? 1500 : 6000);
  return page;
}

async function pins(page) {
  return page.evaluate(() => window.ScrollTrigger.getAll().filter(t => t.pin).map(t => ({ id: t.trigger.id, start: t.start, end: t.end })));
}

async function jump(page, list, id, frac, name) {
  const t = list.find(p => p.id === id);
  const y = t.start + (t.end - t.start) * frac;
  await page.evaluate(y => window.lenis.scrollTo(y, { immediate: true, force: true }), y);
  await sleep(1600);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--hide-scrollbars'] });
try {
  if (ONLY === 'all' || ONLY === 'desktop') {
    const d = await open(browser, { width: 1440, height: 900 }, { tag: 'desktop' });
    await d.screenshot({ path: `${OUT}/d-00-hero.png` });
    const list = await pins(d);
    console.log('pins', JSON.stringify(list));
    const plan = [
      ['hero', 0.62, 'd-01-hero-iris'],
      ['press', 0.05, 'd-02-press-start'], ['press', 0.55, 'd-03-press-mid'],
      ['steps', 0.08, 'd-04-steps-orange'], ['steps', 0.14, 'd-05-steps-iris'], ['steps', 0.42, 'd-06-steps-cut'], ['steps', 0.78, 'd-07-steps-pour'],
      ['finale', 0.06, 'd-08-fin-drop'], ['finale', 0.16, 'd-09-fin-curtain'], ['finale', 0.34, 'd-10-fin-rollup'], ['finale', 0.54, 'd-11-fin-sign'], ['finale', 0.72, 'd-12-fin-cups'], ['finale', 0.99, 'd-13-fin-end'],
    ];
    for (const [id, f, n] of plan) await jump(d, list, id, f, n);
    await d.close();
  }
  if (ONLY === 'all' || ONLY === 'phone') {
    const p = await open(browser, { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }, { tag: 'phone' });
    await p.screenshot({ path: `${OUT}/p-00-hero.png` });
    const list = await pins(p);
    for (const [id, f, n] of [['press', 0.4, 'p-01-press'], ['steps', 0.45, 'p-02-steps'], ['finale', 0.16, 'p-03-fin-curtain'], ['finale', 0.99, 'p-04-fin-end']]) await jump(p, list, id, f, n);
    await p.close();
  }
  if (ONLY === 'all' || ONLY === 'rm') {
    const r = await open(browser, { width: 1440, height: 900 }, { rm: true, tag: 'rm' });
    await r.screenshot({ path: `${OUT}/r-full.png`, fullPage: true });
    console.log('rm pins', (await pins(r)).length);
    await r.close();
  }
} finally {
  await browser.close();
  console.log(errors.length ? errors.join('\n') : 'no console errors or warnings');
}
