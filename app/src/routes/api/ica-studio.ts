import {createFileRoute} from '@tanstack/react-router'

// Historical editor-key API is absent from the public ICA operating surface.
const retired=async()=>new Response(null,{status:404,headers:{
 'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'
}})
export const Route=createFileRoute('/api/ica-studio')({
 server:{handlers:{GET:retired,POST:retired,PUT:retired,PATCH:retired,DELETE:retired}}
} as any)
