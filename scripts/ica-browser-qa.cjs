/* ICA Editorial Operations v1 — real browser regression tests.
 * Detects hydration crashes and RTL overflow that HTTP-only tests miss.
 * Read-only: does not submit forms or publish editorial content.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const base = 'https://ica-international-portal.vercel.app';
  const cases = [
    { name: 'desktop English', url: base + '/', width: 1365, height: 850, lang: 'en', dir: 'ltr' },
    { name: 'mobile English', url: base + '/', width: 375, height: 812, lang: 'en', dir: 'ltr' },
    { name: 'Sorani Kurdish', url: base + '/?lang=ckb', width: 390, height: 844, lang: 'ckb', dir: 'rtl' },
    { name: 'Arabic newsroom', url: base + '/desk/latest?lang=ar', width: 390, height: 844, lang: 'ar', dir: 'rtl' },
    { name: 'Simplified Chinese', url: base + '/?lang=zh', width: 1280, height: 800, lang: 'zh', dir: 'ltr' },
    { name: 'editorial sign-in', url: base + '/studio', width: 1024, height: 768, lang: 'en', dir: 'ltr' },
    { name: 'CCC gateway', url: 'https://ccc-iraq-cultural-centre.vercel.app/ica', width: 390, height: 844, lang: 'en', dir: 'ltr', ccc: true }
  ];
  try {
    for (const test of cases) {
      const page = await browser.newPage({ viewport: { width: test.width, height: test.height } });
      const errors = [];
      const failures = [];
      page.on('pageerror', error => errors.push(String(error)));
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text().slice(0, 500));
      });
      page.on('requestfailed', request => failures.push(request.url() + ': ' + request.failure()?.errorText));
      const response = await page.goto(test.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1200);
      const state = await page.evaluate(() => ({
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        bodyText: (document.body?.innerText || '').slice(0, 2500),
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        linkCount: document.querySelectorAll('a').length
      }));
      assert.equal(response.status(), 200, test.name + ' status');
      assert.equal(state.lang, test.lang, test.name + ' lang');
      assert.equal(state.dir, test.dir, test.name + ' direction');
      assert.ok(state.linkCount >= (test.name === 'editorial sign-in' ? 1 : 11), test.name + ' links');
      assert.ok(!state.bodyText.startsWith('Unable to load'), test.name + ' app crash');
      assert.ok(state.horizontalOverflow <= 2, test.name + ' horizontal overflow: ' + state.horizontalOverflow);
      assert.deepEqual(errors, [], test.name + ' console/hydration errors');
      const actionableFailures = failures.filter(f => !(/net::ERR_ABORTED$/.test(f) && /\/rest\/v1\/ica_reader_events(?:[?:]|$)/.test(f))); 
      if (actionableFailures.length !== failures.length) console.warn('Navigation-aborted optional reader telemetry:', failures.filter(f => !actionableFailures.includes(f))); 
      assert.deepEqual(actionableFailures, [], test.name + ' failed requests');
      if (test.name === 'editorial sign-in') assert.ok(/staff sign in|sign in securely/i.test(state.bodyText), 'staff sign-in form');
      console.log('PASS', test.name);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
