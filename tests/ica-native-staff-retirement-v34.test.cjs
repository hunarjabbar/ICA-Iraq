'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const routeFiles=['app/src/routes/studio.tsx','app/src/routes/app.tsx','app/src/routes/api/ica-studio.ts','app/src/routes/api/ica-upload.ts'];
test('all four public ICA staff and template entry points return non-redirecting HTTP 404',()=>{
 for(const file of routeFiles){
  const source=read(file);
  assert.match(source,/status:404/,file);
  assert.match(source,/no-store/,file);
  assert.doesNotMatch(source,/Location:|ccc-command-centre\.vercel\.app|status:307|EditorialStudio|CustomTemplate|component:/,file);
 }
});
test('ICA public footer has no editorial, staff or console link in any language',()=>{
 const site=read('app/src/components/ica/site.tsx');
 assert.doesNotMatch(site,/path\('\/studio'\)|ccc-command-centre\.vercel\.app|editor:'/,);
});
test('obsolete editor-key login and wire-studio source components are physically deleted',()=>{
 for(const file of ['app/src/components/ica/studio.tsx','app/src/components/ica/wire-studio.tsx','app/src/lib/ica-studio-i18n.ts','app/src/routes/auth/reset.tsx','app/src/routes/auth/verify.tsx','app/src/routes/auth/update-password.tsx'])assert.equal(fs.existsSync(path.join(root,file)),false,file);
});
test('native read-only release checks enforce absent staff routes, not 307 forwarding',()=>{
 const gate=read('scripts/ica-native-origin-smoke.cjs');
 assert.match(gate,/assessStaffUnavailable/);
 assert.doesNotMatch(gate,/assessStaffRedirect|Staff entry not redirected/);
});
