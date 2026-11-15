import {createFileRoute} from '@tanstack/react-router'

/** Former ICA template entry stays as a safe handoff. No second staff dashboard or preview UI. */
export const Route=createFileRoute('/app')({
 server:{handlers:{GET:async()=>new Response(null,{status:307,headers:{
  Location:'https://ccc-command-centre.vercel.app/?workspace=ica',
  'Cache-Control':'no-store',
  'X-Robots-Tag':'noindex,nofollow',
  'X-Content-Type-Options':'nosniff',
 }})}}
} as any)
