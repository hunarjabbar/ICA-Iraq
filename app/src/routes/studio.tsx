import {createFileRoute} from '@tanstack/react-router'

/** Staff entry is exclusively the CCC Central Command Centre. Native legacy studio UI is retired. */
export const Route=createFileRoute('/studio')({
 server:{handlers:{GET:async()=>new Response(null,{status:307,headers:{
  Location:'https://ccc-command-centre.vercel.app/?workspace=ica-editorial',
  'Cache-Control':'no-store',
  'X-Robots-Tag':'noindex,nofollow',
  'X-Content-Type-Options':'nosniff',
 }})}}
} as any)
