import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CCC_CENTRAL_ORIGIN,icaStaffHandoff } from '../src/lib/central-workspace'

describe('ICA single-command-centre staff routing',()=>{
 it('uses one private canonical host and allowlisted workspaces',()=>{
  expect(CCC_CENTRAL_ORIGIN).toBe('https://ccc-command-centre.vercel.app')
  expect(icaStaffHandoff('editorial')).toBe('https://ccc-command-centre.vercel.app/signin?workspace=ica-editorial')
  expect(icaStaffHandoff('executive')).toBe('https://ccc-command-centre.vercel.app/signin?workspace=ica')
 })
 it('does not serve the obsolete ICA access-key login from the /studio route',()=>{
  const page=readFileSync(resolve(import.meta.dir,'../src/routes/studio.tsx'),'utf8')
  expect(page).toContain('icaStaffHandoff')
  expect(page).toContain('window.location.replace')
  expect(page).not.toContain('EditorialStudio')
  expect(page).not.toContain('accessKey')
  expect(page).not.toContain('ICA_EDITOR_KEY')
 })
 it('retired editorial mutation API does not permit duplicate CRUD writes',()=>{
  const src=readFileSync(resolve(import.meta.dir,'../src/routes/api/ica-studio.ts'),'utf8')
  expect(src).toContain("status:410")
  expect(src).toContain('retired:true')
  expect(src).toContain("icaStaffHandoff('editorial')")
  expect(src).not.toContain('makeEditorCookie')
 })
 it('original published ICA news endpoints remain operational and independent of staff handoff',()=>{
  const api=readFileSync(resolve(import.meta.dir,'../src/routes/api/ccc-editorial.ts'),'utf8')
  const publicSubmit=readFileSync(resolve(import.meta.dir,'../src/routes/api/ica.ts'),'utf8')
  expect(api).toContain("status==='published'")
  expect(publicSubmit).toContain('ica_public_submit_v1')
  expect(publicSubmit).not.toContain('service_role')
 })
})
