'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {canonical,central,pages,assessPage,assessStatus,assessStaffUnavailable,run}=
 require('../scripts/ica-native-origin-smoke.cjs');

function html(p){
 return '<!DOCTYPE html><html lang="'+p.language+'"><head>'+
 '<link rel="canonical" href="'+p.canonical+'">'+
 '<link rel="alternate" hreflang="en" href="'+canonical+p.path.split('?')[0]+'">'+
 '</head><body><main>ICA International</main></body></html>';
}

test('native ICA release gate covers ten pages, all language alternates and first-party support',()=>{
 assert.equal(pages.filter(p=>p.id.startsWith('seo:')).length,10);
 assert.equal(pages.filter(p=>p.id.startsWith('localized:')).length,3);
 assert.equal(pages.filter(p=>p.id.startsWith('discover:')).length,4);
 assert.equal(pages.filter(p=>p.id==='reader-support').length,1);
 assert.equal(new Set(pages.map(p=>p.path)).size,pages.length);
 for(const p of pages)assert.deepEqual(assessPage(p,200,html(p)),[],p.id);
});

test('wrong canonical origin, old publisher and a missing locale cannot pass',()=>{
 const p=pages.find(p=>p.id==='seo:/news');
 assert(assessPage(p,200,html(p).replace(canonical,'https://ica-iraqi-chinese-agency.higgsfield.app'))
  .some(x=>x.includes('Wrong canonical')));
 assert(assessPage(p,200,html(p)+'https://ica-publishing-experience.vercel.app/unused')
  .some(x=>x.includes('Obsolete')));
 assert(assessPage(p,200,html(p).replace('lang="en"','lang="ar"'))
  .some(x=>x.includes('Language shell')));
 assert(assessPage(p,404,'DEPLOYMENT_NOT_FOUND').some(x=>x.includes('HTTP 404')));
 assert(assessPage(p,200,html(p)+'SUPABASE_SERVICE_ROLE_KEY')
  .some(x=>x.includes('privileged-key')));
});

test('anonymous status is a public liveness contract, not internal governance telemetry',()=>{
 const valid=JSON.stringify({ok:true,service:'ica-international',check:'public-http-liveness'});
 assert.deepEqual(assessStatus(200,valid),[]);
 assert(assessStatus(404,valid).length);
 assert(assessStatus(200,'<html/>').length);
 assert(assessStatus(200,valid.slice(0,-1)+',"staff":"hidden"}').length);
});

test('ICA public staff routes are unavailable without any redirect',()=>{
 assert.deepEqual(assessStaffUnavailable(404,''),[]);
 assert(assessStaffUnavailable(307,central+'/?workspace=ica-editorial').length);
 assert(assessStaffUnavailable(200,'').length);
 assert(assessStaffUnavailable(404,central+'/signin').length);
});

test('all probes remain credential-free GET and do not log fetched content',async()=>{
 let count=0;
 const results=await run(canonical,async(_url,options)=>{
  count++;
  assert.equal(options.method,'GET');
  assert.equal(options.redirect,'manual');
  assert.equal(options.cache,'no-store');
  assert.equal(options.credentials,'omit');
  assert(!Object.hasOwn(options,'body'));
  const path=new URL(_url).pathname;
  if(['/studio','/app','/api/ica-studio','/api/ica-upload','/auth/reset','/auth/verify','/auth/update-password'].includes(path))return {status:404,headers:new Headers()};
  if(path.startsWith('/discover/')){
    const language=path.slice('/discover/'.length);
    const destination=language==='account'?canonical+'/contact':canonical+'/desk/latest?lang='+language;
    return {status:307,headers:new Headers({location:destination})};
  }
  if(path==='/monitor/status')return {status:200,text:async()=>JSON.stringify({
   ok:true,service:'ica-international',check:'public-http-liveness'})};
  const p=pages.find(x=>x.path===path+(new URL(_url).search||''))||pages.find(x=>x.path===path);
  assert(p,'Unexpected route '+path);
  return {status:200,text:async()=>html(p)};
 });
 assert.equal(results.length,pages.length+8);
 assert.equal(count,results.length);
 assert(results.every(x=>x.errors.length===0),JSON.stringify(results.filter(x=>x.errors.length)));
});

test('native discovery aliases are server-side 307 only and do not leak to legacy providers',()=>{
 const fs=require('node:fs');
 const path=require('node:path');
 const locale=fs.readFileSync(path.join(__dirname,'../app/src/routes/discover/$language.ts'),'utf8');
 const account=fs.readFileSync(path.join(__dirname,'../app/src/routes/discover/account.ts'),'utf8');
 assert.match(locale,/createFileRoute\('\/discover\/\$language'\)/);
 assert.match(locale,/server:\{handlers:\{GET:/);
 assert.match(locale,/en\|ar\|ckb\|zh/);
 assert.match(locale,/status:307/);
 assert.match(locale,/desk\/latest\?lang=/);
 assert.match(locale,/status:404/);
 assert.match(account,/createFileRoute\('\/discover\/account'\)/);
 assert.match(account,/status:307/);
 assert.match(account,/https:\/\/ica-international-portal\.vercel\.app\/contact/);
 assert.doesNotMatch(locale+account,/higgsfield\.app|ica-publishing-experience\.vercel\.app/i);
});
