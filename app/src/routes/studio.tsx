import {createFileRoute} from '@tanstack/react-router'

// Deliberately no public editor, sign-in, redirect, or staff URL.
// The only staff authentication UI belongs to the independent Command Centre.
export const Route=createFileRoute('/studio')({
 server:{handlers:{GET:async()=>new Response(null,{status:404,headers:{
  'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'
 }})}}
} as any)
