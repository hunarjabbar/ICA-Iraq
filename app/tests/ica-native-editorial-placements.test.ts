import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'

const read=(name:string)=>readFileSync(new URL(name,import.meta.url),'utf8')
const managed=read('../src/components/ica/managed-content.tsx')
const site=read('../src/components/ica/site.tsx')
const home=read('../src/routes/index.tsx')
const intl=read('../src/components/ica/international.tsx')
describe('ICA original-page content ownership',()=>{
 test('all public shells share only independently published ICA page snapshots',()=>{
  expect(site).toContain('<ICAContentProvider><Header/>')
  expect(managed).toContain('getManagedPageBlocks({data:{page,lang}})')
  expect(managed).not.toContain('draft_document')
  expect(managed).toContain("published_document:Record<string,string>")
 })
 test('homepage native zones replace existing copy without duplicate bottom cards',()=>{
  expect(managed).toContain("hero:'home-headline'")
  expect(managed).toContain("featureStrip:'feature-strip'")
  expect(managed).toContain("culture:'culture-spotlight'")
  expect(managed).toContain("video:'video-stage'")
  expect(managed).toContain('nativeSlotSections.get(b.block_key)===b.section')
  expect(intl).toContain("useManagedICAZone('hero',ICA_NATIVE_HOME_ZONES.hero)")
  expect(home).toContain("useManagedICAZone('feature',ICA_NATIVE_HOME_ZONES.culture)")
  expect(home).toContain("useManagedICAZone('feature',ICA_NATIVE_HOME_ZONES.video)")
  expect(home).toContain("return <Shell mainClass=\"ica-home\"><HomeSections/></Shell>")
 })
 test('shared page and desk introductions remain managed only at their original positions',()=>{
  expect(site).toContain("useManagedICAZone('hero','page-headline')")
  expect(intl).toContain("useManagedICAZone('hero','page-headline')")
  expect(managed).toContain("b.section==='hero'&&b.block_key==='page-headline'")
 })
})
