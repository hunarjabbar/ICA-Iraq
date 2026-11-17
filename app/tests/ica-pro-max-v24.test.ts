import {describe,expect,test} from 'bun:test'
import {readFileSync} from 'node:fs'

const read=(path:string)=>readFileSync(new URL(path,import.meta.url),'utf8')
const styles=read('../src/styles.css')
const intl=read('../src/components/ica/international.tsx')
const site=read('../src/components/ica/site.tsx')
const v24=styles.split('/* ICA v24 — UI UX Pro Max editorial-system refinement.')[1]

describe('ICA editorial design v24',()=>{
 test('refines existing ICA design tokens rather than replacing the shared app theme',()=>{
  expect(v24).toBeDefined()
  for(const token of [
   '--ica-surface:#ffffff',
   '--ica-surface-soft:#f7f6f3',
   '--ica-ui-line:#e6e2df',
   '--ica-display:"Inter"',
   '--ica-body:"Inter"',
   'background:var(--ica-ivory)',
   '.ica-intl-desk-card',
   '.ica-trending-tile',
   '.ica-managed-card',
   '.ica-newsletter',
   '.ica-desk-verify'
  ])expect(v24).toContain(token)
  expect(styles).toContain('ICA v23 | Emil mobile-native + apple-design + animate.')
  expect(styles).toContain('ICA International v21 — compact, editorial-responsive proportional system.')
 })
 test('icon actions share sizing and accessible semantics',()=>{
  expect(intl).toContain("import {ChevronRight,ExternalLink} from 'lucide-react'")
  expect(intl).toContain('className="ica-action-icon" aria-hidden="true"')
  expect(intl).toContain('ica-action-icon--forward')
  expect(v24).toContain('.ica-site .ica-action-icon')
  expect(v24).toContain('.ica-site[dir="rtl"] .ica-action-icon--forward')
  expect(intl).not.toContain('<span aria-hidden="true">→</span>')
 })
 test('buttons and form fields have consistently sized focusable controls without gloss',()=>{
  for(const rule of [
   '.ica-header-v20 .ica-nav-contact',
   '.ica-desk-filter-header>button',
   '.ica-desk-controls button',
   '.ica-contact-form>button',
   '.ica-newsletter-entry button',
   'background-image:none',
   'box-shadow:none',
   'min-height:44px',
   ':focus-visible',
   '[aria-disabled="true"]'
  ])expect(v24).toContain(rule)
  expect(v24).not.toContain('transition:all')
  expect(v24).not.toContain('will-change:transform')
 })
 test('supports Arabic/Sorani and Chinese without altering responsive or reduced-motion behavior',()=>{
  expect(v24).toContain('.ica-site:is([lang="ar"],[lang="ckb"])')
  expect(v24).toContain('.ica-site[lang="zh"]')
  expect(v24).toContain('letter-spacing:normal')
  expect(v24).toContain('@media(max-width:640px)')
  expect(v24).toContain('@media(prefers-reduced-motion:reduce)')
  expect(site).toContain('ica-header-v20')
  expect((v24.match(/\\{/g)||[]).length).toBe((v24.match(/\\}/g)||[]).length)
 })
})
