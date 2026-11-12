import {createFileRoute} from '@tanstack/react-router'
import {createServerOnlyFn} from '@tanstack/react-start'
const readMedia=createServerOnlyFn(async (id:string):Promise<Response>=>{
  if(!/^[0-9a-f-]{36}\.(png|jpg|jpeg|webp|mp4|pdf)$/i.test(id))return new Response('Invalid media',{status:400})
  const {bindings}=await import('../../../lib/bindings.server')
  const r2=bindings().STORAGE
  if(!r2)return new Response('Media storage unavailable',{status:503})
  const blob=await r2.get('ica/'+id)
  if(!blob)return new Response('Not found',{status:404})
  const h=new Headers()
  h.set('Content-Type',blob.httpMetadata?.contentType || 'application/octet-stream')
  h.set('Cache-Control','public, max-age=86400')
  h.set('X-Content-Type-Options','nosniff')
  return new Response(await blob.arrayBuffer(),{headers:h})
})
export const Route=createFileRoute('/api/media/$id')({
 server:{handlers:{GET:async({params}:{params:{id:string}})=>readMedia(params.id)}}
} as any)
