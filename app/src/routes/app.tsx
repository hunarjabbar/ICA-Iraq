import {createFileRoute} from '@tanstack/react-router'

// The old application template was a separate public-facing operations entry.
// Do not forward, sign in, or expose a legacy dashboard from this public origin.
export const Route=createFileRoute('/app')({
 server:{handlers:{GET:async()=>new Response(null,{status:404,headers:{
  'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'
 }})}}
} as any)
