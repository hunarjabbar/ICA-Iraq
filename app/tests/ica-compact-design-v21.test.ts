import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'

const read=(name:string)=>readFileSync(new URL(name,import.meta.url),'utf8')
const css=read('../src/styles.css')
const managed=read('../src/components/ica/managed-content.css')
const home=read('../src/routes/index.tsx')
const site=read('../src/components/ica/site.tsx')
const browser=read('../../scripts/ica-browser-qa.cjs')
const compact=css.split('ICA International v21 — compact, editorial-responsive proportional system.')[1]

describe('ICA public compact editorial design v21',()=>{
 test('scope custom scale to ICA public, preserving shared Quanta/Tailwind rem primitives',()=>{
  expect(compact).toBeDefined()
  for(const token of [
   '--ica-container:1200px',
   '--ica-gutter:clamp(14px,2.25vw,28px)',
   '--ica-section-space:clamp(30px,4vw,54px)',
   '--ica-card-pad:clamp(14px,1.5vw,20px)',
   '--ica-type-body:14px',
   '--ica-type-hero:clamp(33px,4.7vw,59px)',
   '--ica-type-heading:clamp(26px,3vw,43px)',
   'overflow-x:clip'
  ])expect(compact).toContain(token)
  expect(css).toContain('--spacing: 0.25rem')
  expect(compact).not.toContain('zoom:')
  expect(compact).not.toContain('scale(')
  expect(compact).not.toContain('html{font-size:')
 })
 test('compress oversized modules and preserve common gutters across nested routes',()=>{
  for(const token of [
   '.ica-site .ica-intl-hero h1',
   '.ica-site .ica-intl-trending',
   '.ica-site .ica-intl-mosaic',
   '.ica-site .ica-intl-desk-card',
   '.ica-site .ica-wire-lead-art',
   '.ica-site .ica-trending-tile',
   '.ica-site .ica-news-section',
   '.ica-site .ica-newsletter',
   '.ica-site .ica-story-grid',
   '.ica-site .ica-culture-spotlight',
   '.ica-site .ica-video-stage',
   '.ica-site .ica-page-intro',
   '.ica-site .ica-desk-intro',
   '.ica-site .ica-article-content',
   '.ica-site .ica-topic-card',
   '.ica-site .ica-topic-detail',
   '.ica-site .ica-contact-form',
   '.ica-site .ica-footer-upper'
  ])expect(compact).toContain(token)
  expect(managed).toContain('ICA compact-system v21')
  expect(managed).toContain('var(--ica-card-pad')
 })
 test('mobile fixes use real responsive grids, not parent overflow hiding or global zoom',()=>{
  for(const width of [1100,850,640,365])
   expect(compact).toContain('@media(max-width:'+width+'px)')
  expect(compact).toContain('.ica-site .ica-story-grid,.ica-site .ica-media-grid')
  expect(compact).toContain('grid-template-columns:minmax(0,1fr)')
  expect(compact).toContain('--ica-gutter:12px')
  expect(compact).toContain('min-height:44px')
  expect(compact).toContain('var(--ica-type-hero)')
  expect(compact).toContain('.ica-site .ica-header-v20 .ica-menu-drawer')
  expect(compact).toContain('max-height:calc(100dvh - 110px)')
 })
 test('Arabic, Sorani and Chinese have independent readable typographic safeguards',()=>{
  expect(compact).toContain('.ica-site:is([lang="ar"],[lang="ckb"])')
  expect(compact).toContain('font-size:14.5px')
  expect(compact).toContain('.ica-site[lang="zh"]')
  expect(compact).toContain('line-break:strict')
  expect(compact).toContain('letter-spacing:normal')
  expect(css).toContain('unicode-bidi:isolate')
 })
 test('native ICA cards use responsive lazy images and section containers stay semantic',()=>{
  expect(site).toContain('loading="lazy" decoding="async"')
  expect(site).toContain('sizes="(max-width: 640px) 100vw')
  expect(site).toContain('dir="auto"')
  expect(home).toContain('<main className="ica-home-main">')
  expect(home).toContain('loading="lazy" decoding="async"')
  expect(compact).toContain('.ica-home .scroll-scrub__title')
 })
 test('real Chromium device matrix checks visual budgets, source cards and horizontal overflow',()=>{
  for(const feature of [
   'verifyCompactScale',
   'compact English phone',
   'small mobile 360 English desk',
   'phone 480 Arabic Research Atlas',
   'tablet 640 Chinese culture',
   'tablet 820 Sorani contact',
   'desktop 1440 topic directory',
   'mobile video Chinese',
   'no horizontal overflow',
   'cardOverflows',
   'header height',
   'content footprint'
  ])expect(browser).toContain(feature)
 })
})
