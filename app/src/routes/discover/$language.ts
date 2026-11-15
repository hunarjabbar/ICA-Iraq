import {createFileRoute} from '@tanstack/react-router'

/** Canonical first-party discovery handoff. No provider or cross-origin credentials. */
const canonical='https://ica-international-portal.vercel.app'
export const Route=createFileRoute('/discover/$language')({
 server:{handlers:{GET:async({request}:{request:Request})=>{
  const pathname=new URL(request.url).pathname
  const match=/^\/discover\/(en|ar|ckb|zh)\/?$/.exec(pathname)
  if(!match)return new Response('Unknown ICA locale',{status:404,headers:{
   'Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'
  }})
  return new Response(null,{status:307,headers:{
   Location:canonical+'/desk/latest?lang='+match[1],
   'Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'
  }})
 }}}} as any)
