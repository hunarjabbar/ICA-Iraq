const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const origin = (process.env.ICA_TEST_URL || '').replace(/\/$/, '');
if (!/^https:\/\/[-a-z0-9.]+\.vercel\.app$/i.test(origin)) {
  throw new Error('ICA_TEST_URL must be the approved Vercel preview URL');
}
const cases = [
  {label:'desktop international', path:'/', width:1440, height:900, lang:'en', dir:'ltr'},
  {label:'mobile international', path:'/', width:360, height:760, lang:'en', dir:'ltr'},
  {label:'Arabic international', path:'/?lang=ar', width:390, height:844, lang:'ar', dir:'rtl'},
  {label:'Sorani international', path:'/?lang=ckb', width:390, height:844, lang:'ckb', dir:'rtl'},
  {label:'Chinese international', path:'/?lang=zh', width:820, height:1180, lang:'zh', dir:'ltr'},
  {label:'topic directory', path:'/topics', width:390, height:844, lang:'en', dir:'ltr'},
  {label:'news desk', path:'/desk/latest', width:390, height:844, lang:'en', dir:'ltr'},
  {label:'editorial newsroom', path:'/newsroom', width:820, height:1000, lang:'en', dir:'ltr'}
];

(async () => {
  const browser = await chromium.launch({headless:true, args:['--no-sandbox']});
  try {
    for (const item of cases) {
      const page = await browser.newPage({viewport:{width:item.width, height:item.height}});
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      const response = await page.goto(origin + item.path,{waitUntil:'domcontentloaded',timeout:30000});
      assert.equal(response.status(),200,item.label + ' HTTP status');
      await page.waitForTimeout(300);
      const state = await page.evaluate(() => {
        const site = document.querySelector('.ica-site');
        const css = site ? getComputedStyle(site) : null;
        const h1 = site?.querySelector('h1');
        return {
          lang:document.documentElement.lang,dir:document.documentElement.dir,
          overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          surface:css?.getPropertyValue('--ica-surface').trim(),
          line:css?.getPropertyValue('--ica-ui-line').trim(),
          font:css?.fontFamily || '',
          headingFont:h1 ? getComputedStyle(h1).fontFamily : '',
          cards:document.querySelectorAll('.ica-intl-desk-card').length,
          icons:document.querySelectorAll('.ica-action-icon').length
        };
      });
      console.log('INSPECT',item.label,JSON.stringify(state));
      assert.equal(state.lang,item.lang,item.label + ' lang');
      assert.equal(state.dir,item.dir,item.label + ' direction');
      assert.ok(state.overflow<=2,item.label + ' overflow '+state.overflow);
      assert.ok(['#fff','#ffffff'].includes(state.surface),item.label + ' surface token '+state.surface);
      assert.equal(state.line,'#e6e2df',item.label + ' border token');
      const expectedBase = ['ar','ckb'].includes(item.lang) ? 'Noto Sans Arabic' : item.lang==='zh' ? 'Noto Sans SC' : 'Inter';
      assert.ok(state.font.includes(expectedBase),item.label + ' font stack '+state.font);
      if (item.path.startsWith('/?lang=ar') || item.path.startsWith('/?lang=ckb'))
        assert.ok(state.headingFont.includes('Noto Sans Arabic'),item.label + ' heading font '+state.headingFont);
      if (item.path.startsWith('/?lang=zh'))
        assert.ok(state.headingFont.includes('Noto Sans SC'),item.label + ' heading font '+state.headingFont);
      if (item.path==='/')
        assert.ok(state.cards>=6 && state.icons>=6,item.label + ' desks/icons '+JSON.stringify(state));
      assert.deepEqual(errors,[],item.label + ' browser errors');
      console.log('PASS',item.label,JSON.stringify(state));
      await page.close();
    }
    const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    await page.goto(origin + '/',{waitUntil:'domcontentloaded',timeout:30000});
    const motion=await page.evaluate(()=>{
      const icon=document.querySelector('.ica-intl-desk-header .ica-action-icon');
      return icon ? getComputedStyle(icon).transitionDuration : null;
    });
    assert.ok(motion!==null,'reduced-motion action icon missing');
    assert.ok(motion.split(',').every(s=>parseFloat(s)===0),'reduced motion transitions '+motion);
    console.log('PASS reduced motion controls');
    await page.close();
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
