import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'

const styles=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8')
const managed=readFileSync(new URL('../src/components/ica/managed-content.css',import.meta.url),'utf8')
const chrome=styles.split('/* ICA v27 — editorial header rhythm and lightweight 1px card boundaries.')[1]

describe('ICA v27 editorial masthead and card boundary consolidation',()=>{
 test('the final shared public layer owns the complete header and hairline cards',()=>{
  expect(chrome).toBeDefined()
  expect(chrome).toContain('--ica27-card-border:#e8e9ec')
  expect(chrome).toContain('.ica-header-v20 .ica-topline')
  expect(chrome).toContain('.ica-header-v20 .ica-nav')
  expect(chrome).toContain('.ica-header-v20 .ica-header-topicline')
  expect(chrome).toContain('.ica-header-v20 .ica-menu-drawer')
  expect(chrome).toContain('.ica-header-v20 .ica-menu-group a')
  expect(chrome).toContain('border:1px solid var(--ica27-card-border)!important')
  expect(chrome).toContain('border-block-start:1px solid var(--ica27-active)!important')
  expect(chrome).toContain('.ica-managed-card')
 })
 test('responsive menu visibility and enlarged-text/browser controls are preserved',()=>{
  expect(chrome).toContain('@media(max-width:767px)')
  expect(chrome).toContain('min-height:44px')
  expect(chrome).toContain('env(safe-area-inset-top,0px)')
  expect(chrome).toContain('env(safe-area-inset-bottom,0px)')
  expect(chrome).toContain('@media(prefers-reduced-motion:reduce)')
  expect(styles).toContain('.ica-header-v20 .ica-menu-toggle{display:none}')
  expect(styles).toContain('.ica-header-v20 .ica-nav-contact{display:none}')
  const toggle=chrome.match(/\.ica-site \.ica-header-v20 \.ica-menu-toggle,\s*\.ica-site \.ica-header-v20 \.ica-menu-drawer-head button\{([^}]*)\}/)?.[1]
  expect(toggle).not.toMatch(/\bdisplay\s*:/)
  expect(styles).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1/)
  expect(managed).toContain('ICA v26: CMS blocks obey the same narrow outer gutter')
 })
 test('new design is crisp and syntactically balanced',()=>{
  expect(chrome).not.toMatch(/linear-gradient\(|radial-gradient\(|\bzoom\s*:/)
  expect((chrome.match(/\{/g)||[]).length).toBe((chrome.match(/\}/g)||[]).length)
 })
})
