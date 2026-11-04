import {createFileRoute} from '@tanstack/react-router'
import {getWireBoard} from '../../lib/ica-wire.server'
import {deskBySlug} from '../../lib/ica-desks'
export const Route=createFileRoute('/api/ica-wire')({server:{handlers:{GET:async({request})=>{
 const u=new URL(request.url)
 const raw=u.searchParams.get('desk')||'latest'
 const desk=deskBySlug(raw)?raw:'latest'
 try{
  const result=await getWireBoard(desk,90,'blocking')
  return Response.json({ok:true,desk,items:result.items,refreshedAt:result.refreshedAt},{headers:{'Cache-Control':'public,max-age=40,stale-while-revalidate=90','X-Content-Type-Options':'nosniff'}})
 }catch{
  return Response.json({ok:false,desk,items:[],refreshedAt:null},{status:503,headers:{'Cache-Control':'no-store'}})
 }
}}}})
