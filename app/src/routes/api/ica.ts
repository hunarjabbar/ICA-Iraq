import {createFileRoute} from '@tanstack/react-router'
import {database,cleanStr,validLang,consumeRateLimit,hmac} from '../../lib/ica.server'
export const Route=createFileRoute('/api/ica')({
 server:{handlers:{POST:async({request}:{request:Request})=>{
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
 }}} as any)
