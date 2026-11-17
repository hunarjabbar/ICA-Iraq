import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'
const styles=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')
const managed=readFileSync(new URL('../src/components/ica/managed-content.css',import.meta.url),'utf8')
const phone=styles.split('/* ICA v26 — phone-native editorial geometry; Emil mobile-native + UI UX Pro Max.')[1]
describe('ICA v26 native phone width and editorial scale',()=>{
 test('phone typography, gutters and geometry are sourced from one public layer',()=>{
  expect(phone).toBeDefined()
  expect(phone).toContain('--ica-gutter:clamp(8px,2.5vw,11px)')
  expect(phone).toContain('--ica-card-pad:clamp(10px,2.6vw,13px)')
  expect(phone).toContain('--ica-radius:6px')
  expect(phone).toContain('--ica-type-heading:clamp(20px,5.05vw,26px)')
  expect(phone).toContain('max-height:560px')
 })
 test('managed editorial blocks share the phone gutter without extra whitespace',()=>{
  expect(managed).toContain('ICA v26: CMS blocks')
  expect(managed).toContain('width:min(calc(100% - 2 * var(--ica-gutter,10px))')
  expect(managed).toContain('min-height:44px')
 })
 test('keep Safari form zoom prevention and preserve browser zoom accessibility',()=>{
  expect(phone).toContain('font-size:16px')
  expect(styles).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/)
 })
})
