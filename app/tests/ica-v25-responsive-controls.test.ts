import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'

const styles=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')
const v25=styles.split('/* Cohesive control family shared with CCC: quiet surfaces and 9px corners. */')[1]

describe('ICA v25 responsive control visibility',()=>{
 test('global harmonized styles never force display on conditionally hidden controls',()=>{
  expect(v25).toBeDefined()
  const shared=v25.slice(v25.indexOf('.ica-site :is('),v25.indexOf('\n}',v25.indexOf('.ica-site :is('))+2)
  expect(shared).toContain('.ica-menu-toggle')
  expect(shared).toContain('.ica-nav-contact')
  expect(shared).toContain('border-radius:var(--ica-control-radius)')
  expect(shared).not.toMatch(/\bdisplay\s*:/)
 })
 test('header owns wide desktop, tablet and compact mobile visibility',()=>{
  expect(styles).toContain('.ica-header-v20 .ica-menu-toggle{display:none}')
  expect(styles).toContain('@media(max-width:1360px)')
  expect(styles).toContain('.ica-header-v20 .ica-menu-toggle{')
  expect(styles).toContain('.ica-header-v20 .ica-nav-links{display:none}')
  expect(styles).toContain('.ica-header-v20 .ica-nav-contact{display:none}')
 })
})
