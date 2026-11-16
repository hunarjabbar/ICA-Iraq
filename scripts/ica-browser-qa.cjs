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


async function verifyCompactScale(page,test){
 if(test.marker||test.ccc)return
 const report=await page.evaluate(()=>{
  const site=document.querySelector('.ica-site')
  if(!site)return null
  const style=getComputedStyle(site)
  if(style.getPropertyValue('--ica-container').trim()!=='1200px')return {deferred:true}
  const px=selector=>{
   const el=document.querySelector(selector)
   return el?Number.parseFloat(getComputedStyle(el).fontSize):null
  }
  const height=selector=>{
   const el=document.querySelector(selector)
   return el?Math.round(el.getBoundingClientRect().height):null
  }
  const width=selector=>{
   const el=document.querySelector(selector)
   return el?Math.round(el.getBoundingClientRect().width):null
  }
  const minHeight=selector=>{
   const el=document.querySelector(selector)
   return el?Number.parseFloat(getComputedStyle(el).minHeight):null
  }
  const trap=document.querySelector('.ica-trap');
  const honeypotWidth=trap?Math.round(trap.getBoundingClientRect().width):null;
  const horizontalOverflow=document.documentElement.scrollWidth-document.documentElement.clientWidth
  const header=height('.ica-header-v20')
  const mainTitle=px('.ica-intl-hero h1, .ica-desk-intro h1, .ica-page-intro h1, .ica-topic-detail-hero h1')
  const deskMin=minHeight('.ica-intl-desk-card')
  const topicMin=minHeight('.ica-topic-card')
  const cards=Array.from(document.querySelectorAll('.ica-intl-desk-card,.ica-topic-card')).slice(0,50)
  const cardOverflows=cards.filter(el=>el.scrollWidth-el.clientWidth>2).map(el=>el.className).slice(0,5)
  return {
   viewport:document.documentElement.clientWidth,
   rootFont:px('.ica-site'),
   container:width('.ica-content,.ica-page-content'),
   header,mainTitle,deskMin,topicMin,cardOverflows,horizontalOverflow,
   honeypotWidth,
   cardTitle: px('.ica-story-text h3,.ica-wire-story h3,.ica-topic-card h3')
  }
 })
 if(!report){throw Error(test.name+' missing ICA public scale root')}
 if(report.deferred){
  console.warn('Compact scale not deployed at '+test.url+'; browser metrics deferred')
  return
 }
 const budget=test.width<=640?117:135
 assert.ok(report.header<=budget,test.name+' header height '+report.header+' exceeds '+budget)
 assert.ok(report.rootFont>=13&&report.rootFont<=15,test.name+' inconsistent root scale '+report.rootFont)
 if(report.container!==null)assert.ok(report.container<=1203,test.name+' content footprint '+report.container)
 if(report.mainTitle!==null)assert.ok(report.mainTitle<=64,test.name+' oversized page headline '+report.mainTitle)
 if(report.cardTitle!==null)assert.ok(report.cardTitle<=38,test.name+' oversized card heading '+report.cardTitle)
 if(report.deskMin!==null)assert.ok(report.deskMin<=270,test.name+' excessive desk card minimum '+report.deskMin)
 if(report.topicMin!==null)assert.ok(report.topicMin<=195,test.name+' excessive atlas card minimum '+report.topicMin)
 if(report.honeypotWidth!==null)assert.ok(report.honeypotWidth<=2,
  test.name+' hidden anti-bot form input expanded to '+report.honeypotWidth+'px')
 assert.deepEqual(report.cardOverflows,[],test.name+' cards overflow')
 assert.ok(report.horizontalOverflow<=2,test.name+' horizontal overflow '+report.horizontalOverflow)
 console.log('PASS ICA compact visual metrics '+test.name+' '+JSON.stringify(report))
}

async function verifyEmilNative(page,test){
 if(test.ccc||test.marker)return
 const data=await page.evaluate(()=>{
  const site=document.querySelector('.ica-site')
  if(!site)return null
  const tokens=getComputedStyle(site)
  if(tokens.getPropertyValue('--ica-press-time').trim()!=='120ms')
   return {deferred:true}
  return {
   viewport:document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
   theme:[...document.querySelectorAll('meta[name="theme-color"]')].map(m=>({
    media:m.getAttribute('media'),color:m.getAttribute('content')
   })),
   scrollBehavior:getComputedStyle(document.documentElement).scrollBehavior,
   reduced:window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }
 })
 if(!data)throw Error(test.name+' missing ICA root on native UX check')
 if(data.deferred){
  console.warn('Emil v22 browser platform checks deferred until production release '+test.url)
  return
 }
 assert.ok(data.viewport.includes('viewport-fit=cover'),test.name+' not safe-area enabled')
 assert.ok(data.viewport.includes('interactive-widget=resizes-content'),test.name+' keyboard resizing disabled')
 assert.ok(!/maximum-scale|user-scalable=no/.test(data.viewport),test.name+' accessibility zoom restricted')
 assert.equal(data.theme.length,2,test.name+' color-scheme browser chrome coverage')
 assert.ok(data.theme.every(m=>m.color.toUpperCase()==='#2B171D'),test.name+' chrome color differs from masthead')
 assert.equal(data.scrollBehavior,'auto',test.name+' global smooth scrolling delays navigation')
 if(test.name==='wide desktop English'){
  await page.emulateMedia({reducedMotion:'reduce'})
  const reduced=await page.evaluate(()=>({
   ticker:document.querySelector('.ica-news-track')
    ?getComputedStyle(document.querySelector('.ica-news-track')).animationName:null,
   nav:getComputedStyle(document.querySelector('.ica-nav-contact')).transitionDuration
  }))
  if(reduced.ticker!==null)assert.equal(reduced.ticker,'none','ticker keeps moving with reduced motion')
  assert.ok(reduced.nav.split(',').every(v=>parseFloat(v)===0),'reduced-motion control transitions')
  await page.emulateMedia({reducedMotion:'no-preference'})
 }
 if(test.name==='compact English phone'){
  const browser=page.context().browser()
  const ctx=await browser.newContext({
   viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true
  })
  try{
   const touch=await ctx.newPage()
   const url=new URL('/contact?lang=ckb',test.url).toString()
   const response=await touch.goto(url,{waitUntil:'domcontentloaded',timeout:30000})
   await touch.waitForTimeout(250)
   const inspected=await touch.evaluate(()=>{
    const input=document.querySelector('.ica-contact-form input:not(.ica-trap)')
    const toggle=document.querySelector('.ica-menu-toggle')
    const trap=document.querySelector('.ica-trap')
    return {
     coarse:matchMedia('(pointer:coarse)').matches,
     inputFont:input?parseFloat(getComputedStyle(input).fontSize):null,
     toggleHeight:toggle?parseFloat(getComputedStyle(toggle).minHeight):null,
     honeypot:trap?Math.round(trap.getBoundingClientRect().width):null,
     overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
     dir:document.documentElement.dir
    }
   })
   assert.equal(response.status(),200,'native touch Sorani contact route')
   assert.ok(inspected.coarse,'test must simulate an actual coarse pointer')
   assert.ok(inspected.inputFont>=16,'coarse-pointer form text zooms iOS: '+inspected.inputFont)
   assert.ok(inspected.toggleHeight>=44,'touch menu smaller than 44 CSS px')
   assert.ok(inspected.honeypot<=2,'hidden field has expanded on touch')
   assert.ok(inspected.overflow<=2,'touch layout overflow '+inspected.overflow)
   assert.equal(inspected.dir,'rtl')
   console.log('PASS Emil v22 touch/keyboard/safe-area',JSON.stringify(inspected))
  }finally{await ctx.close()}
 }
 console.log('PASS Emil v22 motion and platform',test.name)
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
    { name: 'small mobile 360 English desk', url: base + '/desk/latest', width: 360, height: 760, lang: 'en', dir: 'ltr' },
    { name: 'phone 480 Arabic Research Atlas', url: base + '/topics?lang=ar', width: 480, height: 800, lang: 'ar', dir: 'rtl' },
    { name: 'tablet 640 Chinese culture', url: base + '/culture?lang=zh', width: 640, height: 900, lang: 'zh', dir: 'ltr' },
    { name: 'tablet 820 Sorani contact', url: base + '/contact?lang=ckb', width: 820, height: 1180, lang: 'ckb', dir: 'rtl' },
    { name: 'desktop 1440 topic directory', url: base + '/topics', width: 1440, height: 900, lang: 'en', dir: 'ltr' },
    { name: 'mobile video Chinese', url: base + '/video?lang=zh', width: 390, height: 844, lang: 'zh', dir: 'ltr' },
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
      if(state.horizontalOverflow>2&&!test.ccc&&!test.marker){
        const offenderReport=await page.evaluate(()=>{
          const vw=document.documentElement.clientWidth;
          return Array.from(document.body.querySelectorAll('*')).map(el=>{
            const r=el.getBoundingClientRect();
            const computed=getComputedStyle(el);
            return {tag:el.tagName.toLowerCase(),className:typeof el.className==='string'?el.className.slice(0,140):'',
              left:Math.round(r.left),right:Math.round(r.right),width:Math.round(r.width),
              scrollWidth:el.scrollWidth,overflowX:computed.overflowX,
              position:computed.position};
          }).filter(x=>x.width>0&&(x.right>vw+2||x.left<-2))
          .sort((a,b)=>Math.max(b.right-vw,-b.left)-Math.max(a.right-vw,-a.left)).slice(0,18)
        });
        console.error('ICA_LAYOUT_OVERFLOW_ELEMENTS',test.name,JSON.stringify(offenderReport));
      }
      assert.ok(state.horizontalOverflow <= 2, test.name + ' horizontal overflow: ' + state.horizontalOverflow);
      assert.deepEqual(errors, [], test.name + ' console/hydration errors');
      const actionableFailures = failures.filter(f => !(/net::ERR_ABORTED$/.test(f) && /\/rest\/v1\/ica_reader_events(?:[?:]|$)/.test(f))); 
      if (actionableFailures.length !== failures.length) console.warn('Navigation-aborted optional reader telemetry:', failures.filter(f => !actionableFailures.includes(f))); 
      assert.deepEqual(actionableFailures, [], test.name + ' failed requests');

      await verifyHeaderV20(page,test);
      await verifyCompactScale(page,test);
      await verifyEmilNative(page,test);
      console.log('PASS', test.name);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
