import {createFileRoute} from '@tanstack/react-router'

/** Reader support remains first-party ICA; never forward sign-in data to old providers. */
export const Route=createFileRoute('/discover/account')({
 server:{handlers:{GET:async()=>new Response(null,{status:307,headers:{
  Location:'https://ica-international-portal.vercel.app/contact',
  'Cache-Control':'no-store','X-Robots-Tag':'noindex','X-Content-Type-Options':'nosniff'
 }})}}} as any)
