'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const editorial=read('app/src/routes/studio.tsx');
const template=read('app/src/routes/app.tsx');
const guard=read('scripts/ica-native-origin-smoke.cjs');
test('native ICA editorial staff route cannot mount the retired in-app studio',()=>{
 assert.match(editorial,/createFileRoute\('\/studio'\)/);
 assert.match(editorial,/server:\{handlers:\{GET:/);
 assert.match(editorial,/status:307/);
 assert.match(editorial,/https:\/\/ccc-command-centre\.vercel\.app\/\?workspace=ica-editorial/);
 assert.doesNotMatch(editorial,/EditorialStudio|component:/);
 assert.match(editorial,/no-store/);
});
test('old ICA template console can only hand off to sole Command Centre',()=>{
 assert.match(template,/createFileRoute\('\/app'\)/);
 assert.match(template,/server:\{handlers:\{GET:/);
 assert.match(template,/status:307/);
 assert.match(template,/https:\/\/ccc-command-centre\.vercel\.app\/\?workspace=ica/);
 assert.doesNotMatch(template,/CustomTemplate|previewMode|component:/);
});
test('public ICA origin regression still checks staff delegation',()=>{
 assert.match(guard,/assessStaffRedirect/);
 assert.match(guard,/ica-editorial/);
});
