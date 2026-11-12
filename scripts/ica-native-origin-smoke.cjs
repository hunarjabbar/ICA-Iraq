#!/usr/bin/env node
'use strict';
// Credential-free ICA release audit. No cookies, user sessions, POSTs, mutation or body logging.
const canonical='https://ica-international-portal.vercel.app';
const central='https://ccc-command-centre.vercel.app';
const blocked=/(?:ica-iraqi-chinese-agency\.higgsfield\.app|(?:ica-publishing-experience|ica-account-security|ica-editorial-command|ica-executive-editorial-directory)\.vercel\.app)/i;
const pagePaths=['/','/news','/newsroom','/contact','/desk/latest','/about','/topics','/culture','/video','/entertainment'];
const pages=[
 ...pagePaths.map(path=>({id:'seo:'+path,path,language:'en',canonical:canonical+path})),
 ...['ar','ckb','zh'].map(language=>({id:'localized:'+language,path:'/?lang='+language,language,canonical:canonical+'/'})),
 ...['en','ar','ckb','zh'].map(language=>({id:'discover:'+language,path:'/discover/'+language,language,canonical:canonical+'/desk/latest',canonicalRoutingOnly:true})),
 {id:'reader-support',path:'/discover/account',language:'en',canonical:canonical+'/contact',canonicalRoutingOnly:true}
];
const hrefForRel=(html,rel)=>{
 const links=html.match(/<link\b[^>]*>/gi)||[];
 const item=links.find(tag=>tag.includes('rel="'+rel+'"')||tag.includes("rel='"+rel+"'"));
 return item&&(item.match(/\bhref\s*=\s*["']([^"']+)["']/i)||[])[1]||'';
};
function assessPage(p,status,html){
 const errors=[];
 if(status!==200)errors.push('HTTP '+status+' instead of 200');
 if(!/^<!doctype html/i.test(html.trim()))errors.push('Not an HTML document');
 const shellLanguage=(html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i)||[])[1];
 if(shellLanguage!==p.language)errors.push('Language shell differs from '+p.language);
 if(hrefForRel(html,'canonical')!==p.canonical)errors.push('Wrong canonical URL');
 if(blocked.test(html))errors.push('Obsolete ICA publishing hostname leaked into SSR');
 if(/\b(?:service_role|SUPABASE_SERVICE_ROLE_KEY)\b/i.test(html))
  errors.push('Forbidden privileged-key marker in public SSR');
 if(!p.path.startsWith('/discover')&&!html.includes('rel="alternate"'))
  errors.push('Missing hreflang alternate link');
 return errors;
}
function assessStatus(status,body){
 const errors=[];
 if(status!==200)errors.push('Monitoring status HTTP '+status);
 try{
  const data=JSON.parse(body);
  if(data?.ok!==true||data?.service!=='ica-international'||data?.check!=='public-http-liveness')
   errors.push('Public first-party monitoring contract not present');
  if(/serviceRoleKey|token|secret|staff|private|user/i.test(body))
   errors.push('Public monitoring response includes sensitive metadata');
 }catch{errors.push('Monitoring response is not JSON')}
 return errors;
}
function assessStaffRedirect(status,location){
 const errors=[];
 if(![301,302,307,308].includes(status))errors.push('Staff entry not redirected');
 try{
  const url=new URL(location,canonical);
  if(url.origin!==central||url.searchParams.get('workspace')!=='ica-editorial')
   errors.push('Staff entry does not target ICA editorial workspace in the sole Command Centre');
 }catch{errors.push('Invalid staff redirect')}
 return errors;
}
async function run(base=canonical,request=fetch){
 const baseUrl=new URL(base);
 if(!/^https:$/.test(baseUrl.protocol)||!(baseUrl.hostname==='ica-international-portal.vercel.app'||
    /^ica-international-portal-[a-z0-9-]+\.vercel\.app$/.test(baseUrl.hostname)))
  throw Error('Audit origin must be canonical ICA or an ICA preview deployment');
 const isCanonical=baseUrl.origin===canonical;
 const selected=pages.filter(p=>isCanonical||!p.canonicalRoutingOnly);
 const jobs=[...selected,{id:'monitor',path:'/monitor/status'},{id:'staff-entry',path:'/studio'}];
 const results=[];
 for(let i=0;i<jobs.length;i+=3){
  const batch=await Promise.all(jobs.slice(i,i+3).map(async p=>{
   try{
    const response=await request(baseUrl.origin+p.path,{
     method:'GET',redirect:'manual',cache:'no-store',credentials:'omit',
     signal:AbortSignal.timeout(15000),headers:{accept:'text/html,application/json','user-agent':'ICA-Native-Origin-Audit/1.0'}
    });
    if(p.id==='staff-entry')
     return {id:p.id,errors:assessStaffRedirect(response.status,response.headers.get('location')||'')};
    const body=await response.text();
    return {id:p.id,errors:p.id==='monitor'?assessStatus(response.status,body):
     assessPage(p,response.status,body)};
   }catch(error){return {id:p.id,errors:['Read-only probe unavailable: '+String(error?.name||'request failed')]}};
  }));
  results.push(...batch);
 }
 return results;
}
module.exports={canonical,central,pages,assessPage,assessStatus,assessStaffRedirect,run};
if(require.main===module){
 run(process.env.ICA_AUDIT_URL||canonical).then(results=>{
  for(const r of results)console.log((r.errors.length?'FAIL ':'PASS ')+r.id+
   (r.errors.length?' — '+r.errors.join('; '):''));
  const good=results.filter(x=>!x.errors.length).length;
  console.log('ICA_FIRST_PARTY_ORIGIN_RELEASE_GATE: '+good+'/'+results.length+' read-only probes.');
  if(good!==results.length)process.exitCode=1;
 }).catch(error=>{console.error('ICA origin audit unavailable: '+String(error?.message||error));process.exitCode=1});
}
