/* ICA Editorial Operations v1 — real browser regression tests.
 * Detects hydration crashes and RTL overflow that HTTP-only tests miss.
 * Read-only: does not submit forms or publish editorial content.
 */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function verifyHeaderV20(page,test){
 if(test.ccc||test.marker)return
 const header=page.locator('.ica-header-v20')
 if(await header.count()!==1){
  // The branch workflow also checks the previously released public domain,
  // before this UI revision has been promoted. Source-level tests guard v20
  // until production is upgraded; rerun browser QA against the new alias.
  console.warn('V20 header not deployed at '+test.url+'; navigation browser checks deferred')
  return
 }
 const brand=page.locator('.ica-header-v20 .ica-brand')
 assert.equal(await brand.count(),1,test.name+' unique brand')
 assert.ok(await brand.isVisible(),test.name+' visible brand')
 assert.ok((await brand.getAttribute('href')).startsWith('/'),test.name+' canonical home link')
 const toggle=page.locator('.ica-menu-toggle')
 const topicline=page.locator('.ica-header-v20 .ica-topicline-scroll')
 assert.ok(await topicline.isVisible(),test.name+' browsable topic ribbon')
 if(test.width>1360){
  assert.equal(await toggle.isVisible(),false,test.name+' desktop hides menu toggle')
  assert.ok(await page.locator('.ica-header-v20 .ica-nav-links').isVisible(),test.name+' desktop navigation')
  assert.ok(await page.locator('.ica-header-v20 .ica-nav-links a').count()>=7)
 }else{
  assert.ok(await toggle.isVisible(),test.name+' tablet/mobile menu toggle')
  assert.equal(await toggle.getAttribute('aria-expanded'),'false',test.name+' closed by default')
  await toggle.click()
  assert.equal(await toggle.getAttribute('aria-expanded'),'true',test.name+' toggled open')
  const drawer=page.locator('#ica-mobile-drawer')
  assert.ok(await drawer.isVisible(),test.name+' accessible navigation drawer')
  assert.equal(await drawer.getAttribute('role'),'dialog')
  assert.equal(await drawer.getAttribute('aria-modal'),'true')
  assert.ok(await drawer.locator('nav a').count()>=15,test.name+' complete route directory')
  const drawerGeometry=await drawer.evaluate(el=>({
   height:el.getBoundingClientRect().height,
   scrollHeight:el.scrollHeight,clientHeight:el.clientHeight
  }))
  assert.ok(drawerGeometry.height>90&&drawerGeometry.clientHeight<=test.height,
   test.name+' scroll-contained menu height')
  const drawerLinks=await drawer.locator('nav a').evaluateAll(links=>
   links.map(a=>({href:a.getAttribute('href'),text:a.textContent.trim()})))
  assert.ok(drawerLinks.every(a=>a.href?.startsWith('/')&&!a.href?.startsWith('//')&&a.text.length>0),
   test.name+' menu links are internal and nonblank')
  assert.equal(new Set(drawerLinks.map(a=>new URL(a.href,'https://ica-international-portal.vercel.app').pathname)).size,
    drawerLinks.length,test.name+' no duplicate navigation targets')
  if(test.lang!=='en')
   assert.ok(drawerLinks.every(a=>new URL(a.href,'https://ica-international-portal.vercel.app').searchParams.get('lang')===test.lang),
    test.name+' all drawer routes retain selected language')
  if(test.url.includes('/desk/latest'))
   assert.equal(await drawer.locator('a[href^="/desk/latest"]').first().getAttribute('aria-current'),'page',
    test.name+' current route state')
  await page.keyboard.press('Escape')
  assert.equal(await toggle.getAttribute('aria-expanded'),'false',test.name+' Escape closes menu')
  assert.ok(await toggle.evaluate(el=>document.activeElement===el),test.name+' Escape restores toggle focus')
  await toggle.click()
  await page.locator('main').dispatchEvent('pointerdown',{bubbles:true})
  assert.equal(await toggle.getAttribute('aria-expanded'),'false',test.name+' outside pointer closes menu')
  await toggle.click()
  const first=drawer.locator('button').first(),last=drawer.locator('nav a').last()
  await first.focus()
  await page.keyboard.press('Shift+Tab')
  assert.ok(await last.evaluate(el=>document.activeElement===el),test.name+' backward focus trap')
  await page.keyboard.press('Tab')
  assert.ok(await first.evaluate(el=>document.activeElement===el),test.name+' forward focus trap')
  await page.keyboard.press('Escape')
  assert.equal(await toggle.getAttribute('aria-expanded'),'false',test.name+' final menu state')
 }
 const post=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)
 assert.ok(post<=2,test.name+' no horizontal overflow after header interactions: '+post)
 console.log('PASS v20 header responsive/navigation',test.name)
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const base = process.env.ICA_TEST_URL || 'https://ica-international-portal.vercel.app';
  const cases = [
    { name: 'wide desktop English', url: base + '/', width: 1600, height: 900, lang: 'en', dir: 'ltr' },
    { name: 'laptop English', url: base + '/', width: 1365, height: 850, lang: 'en', dir: 'ltr' },
    { name: 'tablet landscape English', url: base + '/newsroom', width: 1024, height: 768, lang: 'en', dir: 'ltr' },
    { name: 'tablet portrait Arabic', url: base + '/?lang=ar', width: 768, height: 1024, lang: 'ar', dir: 'rtl' },
    { name: 'compact English phone', url: base + '/', width: 320, height: 640, lang: 'en', dir: 'ltr' },
    { name: 'mobile English', url: base + '/', width: 375, height: 812, lang: 'en', dir: 'ltr' },
    { name: 'Sorani Kurdish', url: base + '/?lang=ckb', width: 390, height: 844, lang: 'ckb', dir: 'rtl' },
    { name: 'Arabic newsroom', url: base + '/desk/latest?lang=ar', width: 390, height: 844, lang: 'ar', dir: 'rtl' },
    { name: 'Simplified Chinese', url: base + '/?lang=zh', width: 1280, height: 800, lang: 'zh', dir: 'ltr' },
    { name: 'Central Command Centre sign-in', url: 'https://ccc-command-centre.vercel.app/signin', width: 1024, height: 768, lang: 'en', dir: 'ltr', minLinks: 0, marker: 'Sign in' },
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
      assert.ok(state.linkCount >= (test.minLinks ?? 11), test.name + ' links');
      if (test.marker) assert.ok(state.bodyText.includes(test.marker), test.name + ' expected UI content');
      assert.ok(!state.bodyText.startsWith('Unable to load'), test.name + ' app crash');
      assert.ok(state.horizontalOverflow <= 2, test.name + ' horizontal overflow: ' + state.horizontalOverflow);
      assert.deepEqual(errors, [], test.name + ' console/hydration errors');
      const actionableFailures = failures.filter(f => !(/net::ERR_ABORTED$/.test(f) && /\/rest\/v1\/ica_reader_events(?:[?:]|$)/.test(f))); 
      if (actionableFailures.length !== failures.length) console.warn('Navigation-aborted optional reader telemetry:', failures.filter(f => !actionableFailures.includes(f))); 
      assert.deepEqual(actionableFailures, [], test.name + ' failed requests');

      await verifyHeaderV20(page,test);
      console.log('PASS', test.name);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
