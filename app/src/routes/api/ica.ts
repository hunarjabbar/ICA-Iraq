import {createFileRoute} from '@tanstack/react-router'
import {createServerOnlyFn} from '@tanstack/react-start'

// Public form submissions must not depend on Cloudflare D1 when deployed to Vercel.
// Supabase performs input validation, rate limiting and append-only writes in a
// restricted RPC using the publishable key; no service-role credentials are used.
async function handleVercelPublicSubmission(request:Request):Promise<Response>{
 const responseHeaders={ 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff' }
 const contentType=(request.headers.get('content-type')||'').split(';')[0].trim().toLowerCase()
 if(contentType!=='application/json') return Response.json({ok:false,error:'JSON required'},{status:415,headers:responseHeaders})
 if(Number(request.headers.get('content-length')||0)>6000)return Response.json({ok:false,error:'Request too large'},{status:413,headers:responseHeaders})
 const origin=request.headers.get('origin')
 if(origin){
  try{
   if(new URL(origin).origin!==new URL(request.url).origin)
    return Response.json({ok:false,error:'Cross-origin submission blocked'},{status:403,headers:responseHeaders})
  }catch{return Response.json({ok:false,error:'Invalid request origin'},{status:403,headers:responseHeaders})}
 }
 let input:unknown
 try{input=await request.json()}catch{return Response.json({ok:false,error:'Malformed JSON'},{status:400,headers:responseHeaders})}
 if(!input||typeof input!=='object'||Array.isArray(input))
  return Response.json({ok:false,error:'Invalid request'},{status:400,headers:responseHeaders})
 const d=input as Record<string,unknown>
 const action=typeof d.action==='string'?d.action:''
 if(!['contact','subscribe'].includes(action))
  return Response.json({ok:false,error:'Unsupported action'},{status:400,headers:responseHeaders})
 const field=(key:string,max:number)=>typeof d[key]==='string'?d[key].slice(0,max):''
 const url=process.env.ICA_SUPABASE_URL||process.env.VITE_ICA_SUPABASE_URL
 const key=process.env.ICA_SUPABASE_PUBLISHABLE_KEY||process.env.VITE_ICA_SUPABASE_PUBLISHABLE_KEY
 if(!url||!/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(url)||!key)
  return Response.json({ok:false,error:'Submission service unavailable'},{status:503,headers:responseHeaders})
 try{
  const target=new URL('/rest/v1/rpc/ica_public_submit_v1',url)
  const result=await fetch(target.toString(),{
   method:'POST',
   headers:{apikey:key,'Content-Type':'application/json','Accept':'application/json'},
   body:JSON.stringify({p_action:action,p_data:{
    email:field('email',240),name:field('name',120),topic:field('topic',80),
    message:field('message',4000),lang:field('lang',5),website:field('website',200)
   }}),
   signal:AbortSignal.timeout(8000),
   cache:'no-store'
  })
  if(!result.ok) return Response.json({ok:false,error:'Submission service unavailable'},{status:503,headers:responseHeaders})
  const reply=await result.json() as {ok?:boolean;code?:string;message?:string}
  if(reply?.ok===true) return Response.json({ok:true,message:reply.message||'Request accepted'},{headers:responseHeaders})
  const status=reply?.code==='rate_limited'?429:400
  return Response.json({ok:false,error:status===429?'Please try again later':'Complete all required fields'},{status,headers:responseHeaders})
 }catch{
  return Response.json({ok:false,error:'Submission service temporarily unavailable'},{status:503,headers:responseHeaders})
 }
}

const handlePost=createServerOnlyFn(async(request:Request)=>{
 if(process.env.VERCEL) return handleVercelPublicSubmission(request)
 const {database,cleanStr,validLang,consumeRateLimit,hmac}=await import('../../lib/ica.server')
  if((request.headers.get('content-type')||'').split(';')[0]!=='application/json')return Response.json({ok:false,error:'JSON required'},{status:415})
  if(Number(request.headers.get('content-length')||0)>14000)return Response.json({ok:false,error:'Request too large'},{status:413})
  let body:Record<string,unknown>
  try{body=await request.json() as Record<string,unknown>}catch{return Response.json({ok:false,error:'Malformed request'},{status:400})}
  if(body?.website)return Response.json({ok:true})
  const action=cleanStr(body?.action,20)
  const db=database();if(!db)return Response.json({ok:false,error:'Service unavailable'},{status:503})
  const ip=cleanStr(request.headers.get('CF-Connecting-IP')||'anonymous',100)
  const key=await hmac(ip+':'+new Date().toISOString().slice(0,10),'ica-public-rate-v1')
  if(!await consumeRateLimit('public:'+key,5))return Response.json({ok:false,error:'Please try again later'},{status:429})
  if(action==='subscribe'){
   const email=cleanStr(body.email,240).toLowerCase()
   const lang=cleanStr(body.lang,5)
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return Response.json({ok:false,error:'Valid email required'},{status:400})
   await db.prepare('INSERT OR IGNORE INTO ica_subscribers(email,lang) VALUES(?,?)').bind(email,validLang(lang)?lang:'en').run()
   return Response.json({ok:true,message:'Subscription recorded'})
  }
  if(action==='contact'){
   const name=cleanStr(body.name,120),email=cleanStr(body.email,240),topic=cleanStr(body.topic,80),message=cleanStr(body.message,4000)
   if(name.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||topic.length<3||message.length<12)return Response.json({ok:false,error:'Complete all fields'},{status:400})
   await db.prepare('INSERT INTO ica_messages(id,name,email,topic,message) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),name,email,topic,message).run()
   return Response.json({ok:true,message:'Your message has been received'})
  }
  return Response.json({ok:false,error:'Unsupported action'},{status:400})
})
export const Route=createFileRoute('/api/ica')({server:{handlers:{POST:({request}:{request:Request})=>handlePost(request)}}} as any)
