import {createFileRoute} from '@tanstack/react-router'

// No public-origin endpoint for editorial staff uploads or staff login handoffs.
const retired=async()=>new Response(null,{status:404,headers:{
 'Cache-Control':'no-store','X-Robots-Tag':'noindex,nofollow','X-Content-Type-Options':'nosniff'
}})
export const Route=createFileRoute('/api/ica-upload')({
 server:{handlers:{GET:retired,POST:retired,PUT:retired,PATCH:retired,DELETE:retired}}
} as any)
