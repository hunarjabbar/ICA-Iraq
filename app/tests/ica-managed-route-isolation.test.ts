import {describe,expect,test} from 'bun:test'
import {managedPageForPathname,localizedManagedHref} from '../src/lib/ica-managed-routes'
describe('ICA managed page routing is exact',()=>{
 test('matches only public section and desk roots',()=>{
  for(const [path,page] of [['/','home'],['/news','news'],['/news/','news'],['/topics','topics'],['/culture','culture'],['/desk/bilateral','desk-bilateral'],['/desk/hong-kong/','desk-hong-kong']] as const)
   expect(managedPageForPathname(path)).toBe(page)
 })
 test('never injects a parent page card on article or private routes',()=>{
  for(const path of ['/news/story','/topics/research-lead','/desk/bilateral/story','/app','/studio','/signin','/api/ica','/discover','/monitor','/desk','/newsroom/preview','/topics/lead/2026'])
   expect(managedPageForPathname(path)).toBeNull()
 })
 test('appends the locale before query fragment and preserves the hash',()=>{
  expect(localizedManagedHref('/about#team','ckb')).toBe('/about?lang=ckb#team')
  expect(localizedManagedHref('/news?desk=china#source','zh')).toBe('/news?desk=china&lang=zh#source')
  expect(localizedManagedHref('/about#team','en')).toBe('/about#team')
  expect(localizedManagedHref('https://example.org','ar')).toBe('https://example.org')
  expect(localizedManagedHref('//example.org','ar')).toBe('//example.org')
 })
})
