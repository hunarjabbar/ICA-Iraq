import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'
const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8')
const adapter=read('../src/lib/ica-vercel-public.server.ts')
const route=read('../src/routes/news/$slug.tsx')
const fn=read('../src/lib/ica.functions.ts')
describe('ICA independent live newsroom publication contract',()=>{
 test('public adapter always queries published rows by original article identity',()=>{
  expect(adapter).toContain("status:'eq.published'")
  expect(adapter).toContain("article_id:'eq.'+articleId")
  expect(adapter).toContain("select:'id,article_id,lang,headline,body,source_url,urgency,published_at'")
  expect(adapter).not.toContain('service_role')
 })
 test('public view uses original four-language article shell with published-only live source',()=>{
  expect(route).toContain('getPublicIcaLiveUpdates({data:{articleId:article.id}})')
  expect(route).toContain('className="ica-live-timeline"')
  expect(route).toContain('window.setInterval(()=>{void update()},30000)')
  expect(route).toContain('visibilitychange')
  expect(route).toContain('lang={update.lang}')
  expect(route).toContain('rel="noopener noreferrer"')
  expect(fn).toContain("createServerFn({method:'GET'})")
 })
 test('private authoring remains absent from the public ICA app',()=>{
  expect(route).not.toContain('ccc_cc_ica_live_v43')
  expect(route).not.toContain('storage.from')
  expect(adapter).not.toContain('ica_dam_assets_v40')
 })
})
