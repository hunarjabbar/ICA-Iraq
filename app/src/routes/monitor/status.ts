import {createFileRoute} from '@tanstack/react-router'

/** Public HTTP liveness only: never expose internal roles, providers, or staff status. */
export const Route=createFileRoute('/monitor/status')({
 server:{handlers:{GET:async()=>Response.json({
  ok:true,
  service:'ica-international',
  check:'public-http-liveness',
  certification:'not-a-transaction-or-authentication-test',
 },{headers:{
  'Cache-Control':'no-store',
  'X-Content-Type-Options':'nosniff',
  'X-Robots-Tag':'noindex',
 }})}}
} as any)
