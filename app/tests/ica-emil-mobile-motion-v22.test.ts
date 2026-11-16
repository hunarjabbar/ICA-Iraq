import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'

const read=(name:string)=>readFileSync(new URL(name,import.meta.url),'utf8')
const css=read('../src/styles.css')
const managed=read('../src/components/ica/managed-content.css')
const root=read('../src/routes/__root.tsx')
const theme=read('../src/lib/ica-theme.ts')
const manifest=JSON.parse(read('../public/site.webmanifest'))
const browser=read('../../scripts/ica-browser-qa.cjs')
const v22=css.split('/* ICA v22 — Emil Kowalski design-engineering/mobile-native review.')[1]

describe('ICA v22 mobile-native and reviewed interaction motion',()=>{
 test('viewport preserves zoom while enabling native cutouts and keyboard resizing',()=>{
  expect(root).toContain('viewport-fit=cover,interactive-widget=resizes-content')
  expect(root).not.toContain('user-scalable=no')
  expect(root).not.toContain('maximum-scale=1')
  expect(theme).toContain("ICA_CHROME_COLOR = '#2B171D'")
  expect(root).toContain("{name:'theme-color',content:ICA_CHROME_COLOR}")
  expect(root).not.toContain("media:'(prefers-color-scheme: dark)'")
  expect(manifest.theme_color).toBe('#2B171D')
  expect(manifest.background_color).toBe('#FCFBF8')
 })
 test('native mobile surface uses platform capabilities rather than user-agent checks',()=>{
  expect(v22).toBeDefined()
  for(const rule of [
   '-webkit-tap-highlight-color:transparent',
   '-webkit-text-size-adjust:100%',
   'touch-action:manipulation',
   '-webkit-user-select:none',
   '-webkit-touch-callout:none',
   'max(16px,1em)',
   'env(safe-area-inset-left,0px)',
   'env(safe-area-inset-right,0px)',
   'env(safe-area-inset-top,0px)',
   'env(safe-area-inset-bottom,0px)',
   'overscroll-behavior:contain',
   '(hover:hover) and (pointer:fine)',
   '(pointer:coarse)'
  ])expect(v22).toContain(rule)
  expect(v22).not.toMatch(/userAgent|navigator\.userAgent|touchmove|preventDefault\(\)/)
  expect(v22).not.toMatch(/user-select:none;\s*}\s*body/)
 })
 test('button feedback is short and predictable and card hover is mouse-only',()=>{
  expect(v22).toContain('--ica-ease-out:cubic-bezier(0.23,1,0.32,1)')
  expect(v22).toContain('--ica-press-time:120ms')
  expect(v22).toContain('transform:scale(.97)')
  expect(v22).toContain('.ica-site .ica-story-link:hover .ica-story-image img{transform:scale(1.025)}')
  expect(v22).not.toContain('transition:all')
  expect(v22).not.toContain('ease-in')
  expect(v22).not.toContain('transition:gap')
  expect(css).not.toContain('.ica-topics-home-link:hover{gap:30px')
  expect(css).not.toContain('.ica-topic-card:hover{box-shadow:0 18px 46px')
  expect(css).not.toContain('will-change:transform')
  expect(managed).toContain('(hover:hover) and (pointer:fine)')
  expect(managed).not.toContain('transform:translateY(-2px)')
 })
 test('editorial pages remain readable: never disable selection for the body',()=>{
  expect(v22).toContain('.ica-site :is(button,[role="button"],.ica-menu-toggle,.ica-trending-tile)')
  expect(v22).not.toContain('.ica-site{user-select:none')
  expect(v22).not.toContain('body{user-select:none')
  expect(css).toContain('.ica-site .ica-article-content')
  expect(css).toContain('.ica-site .ica-trap{')
 })
 test('live reporting motion is pausable and respects reduced-motion preference',()=>{
  expect(css).toContain('.ica-news-ticker:focus-within .ica-news-track{animation-play-state:paused}')
  expect(css).toContain('.ica-news-sequence[aria-hidden="true"]{display:none}')
  expect(css).toContain('.ica-news-track{animation:none;transform:none}')
  expect(v22).toContain('@media(prefers-reduced-motion:reduce)')
  expect(css).not.toContain('animation:ica-live-dot 2s')
  expect(css).toContain('.ica-site .ica-header-v20 .ica-menu-drawer')
 })
 test('new checks are exercised in a real responsive browser workflow',()=>{
  for(const key of ['verifyHeaderV20','verifyCompactScale','verifyEmilNative','tablet 820 Sorani contact',
   'phone 480 Arabic Research Atlas','compact English phone'])
    expect(browser).toContain(key)
 })
})
