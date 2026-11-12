import {createFileRoute} from '@tanstack/react-router'
import {bindings} from '../../../lib/bindings.server'
export const Route=createFileRoute('/api/media/$id')({
 server:{handlers:{GET:async({params}:{params:{id:string}})=>{
  const id=params.id
  if(!/^[0-9a-f-]{36}\.(png|jpg|jpeg|webp|mp4|pdf)$/i.test(id))return new Response('Invalid media',{status:400})
  const r2=bindings().STORAGE
  if(!r2)return new Response('Media storage unavailable',{status:503})
  const blob=await r2.get('ica/'+id)
  if(!blob)return new Response('Not found',{status:404})
  const h=new Headers()
  h.set('Content-Type',blob.httpMetadata?.contentType || 'application/octet-stream')
  h.set('Cache-Control','public, max-age=86400')
  h.set('X-Content-Type-Options','nosniff')
  return new Response(await blob.arrayBuffer(),{headers:h})
 }}}} as any)
