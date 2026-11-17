import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'
import {localizedIcaRoute,isActiveIcaHeaderRoute} from '../src/lib/ica-navigation'
import {ICA_DESKS,deskBySlug} from '../src/lib/ica-desks'

const read=(name:string)=>readFileSync(new URL(name,import.meta.url),'utf8')
const site=read('../src/components/ica/site.tsx')
const css=read('../src/styles.css')
const favicon=read('../public/favicon.svg')
const chromiumQA=read('../../scripts/ica-browser-qa.cjs')
describe('ICA International header v20 canonical navigation',()=>{
 test('localized routes preserve intended query/hash and remove stale locale on English',()=>{
  expect(localizedIcaRoute('/desk/latest','ckb')).toBe('/desk/latest?lang=ckb')
  expect(localizedIcaRoute('/topics?subject=Iraq+China#apply','zh'))
   .toBe('/topics?subject=Iraq+China&lang=zh#apply')
  expect(localizedIcaRoute('/contact?lang=ar&subject=visa','en'))
   .toBe('/contact?subject=visa')
  expect(localizedIcaRoute('/about#team','ar')).toBe('/about?lang=ar#team')
  expect(localizedIcaRoute('https://ccc-iraq-cultural-centre.vercel.app/','ar'))
   .toBe('https://ccc-iraq-cultural-centre.vercel.app/')
  expect(localizedIcaRoute('//unexpected.example/path','zh'))
   .toBe('//unexpected.example/path')
 })
 test('active-route logic handles trailing slash, URL queries and articles',()=>{
  expect(isActiveIcaHeaderRoute('/desk/latest/','/desk/latest')).toBe(true)
  expect(isActiveIcaHeaderRoute('/news/a-verified-story','/news')).toBe(true)
  expect(isActiveIcaHeaderRoute('/desk/business?lang=ar','/desk/business')).toBe(true)
  expect(isActiveIcaHeaderRoute('/desk/business','/desk/finance')).toBe(false)
  expect(isActiveIcaHeaderRoute('/','/')).toBe(true)
 })
 test('all editorial desk hrefs originate from existing registered slugs',()=>{
  for(const desk of ICA_DESKS)expect(deskBySlug(desk.slug)).toBeDefined()
  expect(site).toContain("'/desk/'+x.slug")
  expect(site).toContain("'/desk/'+x.slug,deskName(lang,x.slug)")
  expect(site).toContain("isActiveIcaHeaderRoute(current,")
 })
 test('mobile dialog is accessible and always has keyboard/pointer dismissal',()=>{
  for(const contract of [
   'aria-expanded={menuOpen}','aria-controls="ica-mobile-drawer"',
   'aria-modal={menuOpen?', "e.key==='Escape'", "e.key!=='Tab'",
   "document.addEventListener('pointerdown',onPointer)",
   "window.addEventListener('resize',onResize)",
   "document.body.style.overflow='hidden'",
   'aria-current={isActiveIcaHeaderRoute(current,href)',
   'hidden={!menuOpen}'
  ])expect(site).toContain(contract)
 })
 test('real-browser QA covers viewport, keyboard, dialog and RTL navigation behavior',()=>{
  for(const contract of [
   'verifyHeaderV20','wide desktop English','tablet landscape English',
   'tablet portrait Arabic','compact English phone','Sorani Kurdish',
   "page.keyboard.press('Escape')","page.keyboard.press('Shift+Tab')",
   "page.locator('main').dispatchEvent('pointerdown'",
   "test.lang!=='en'","no duplicate navigation targets"
  ])expect(chromiumQA).toContain(contract)
 })
 test('legacy duplicate mobile bars and breakpoint overrides are fully retired',()=>{
  expect(site).not.toContain('MobileNavigation')
  expect(site).not.toContain('ica-mobile-nav')
  expect(css).not.toContain('.ica-mobile-nav')
  expect(css).not.toContain('@media(max-width:1180px)')
  expect(css).not.toContain('@media (min-width:901px) and (max-width:1060px)')
  expect(css).toContain('.ica-header-v20 .ica-menu-toggle')
  expect(css).toContain('The former duplicate legacy navigation selectors have been removed.')
 })
 test('header supports desktop, tablet, compact mobile, RTL, reduced-motion and safe clipping',()=>{
  for(const rule of [
   'ICA International v20', '@media(max-width:1360px)',
   '@media(max-width:900px)', '@media(max-width:700px)',
   '@media(max-width:370px)', '@media(prefers-reduced-motion:reduce)',
   '.ica-header-v20 .ica-menu-drawer[hidden]',
   '.ica-header-v20 .ica-brand-name strong span',
   '.ica-header-v20 .ica-menu-scrim',
   '.ica-site[dir="rtl"] .ica-header-v20 .ica-menu-group',
   'scrollbar-color:#d8c8ce transparent'
  ])expect(css).toContain(rule)
  expect(css).toContain('max-height:min(calc(100dvh - 145px),690px)')
  expect(favicon).toContain('#E3001B')
 })
})
