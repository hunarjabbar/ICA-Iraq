import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'
const server=readFileSync(new URL('../src/lib/ica-vercel-public.server.ts',import.meta.url),'utf8')
describe('ICA short lived public newsroom cache',()=>{
 test('coalesces bursts without persisting private authoring or staff credentials',()=>{
  expect(server).toContain('inFlightReads')
  expect(server).toContain('PUBLIC_CACHE_MAX=96')
  expect(server).toContain("cache:'no-store'")
  expect(server).toContain("const PUBLIC_CACHE_TTL:Record<PublicTable,number>")
  expect(server).not.toContain('service_role')
  expect(server).not.toContain('ica_dam_assets_v40')
 })
 test('keeps publisher authorization switches and breaking updates fresh',()=>{
  expect(server).toContain("'ica_wire_sources':0")
  expect(server).toContain("'ica_live_updates_v42':2000")
  expect(server).toContain("'ica_news_articles':10000")
  expect(server).toContain("if(ttl>0)inFlightReads.set(uri,work)")
 })
})
