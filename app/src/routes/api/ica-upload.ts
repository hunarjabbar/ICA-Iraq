import { createFileRoute } from '@tanstack/react-router'

// Old standalone ICA media-upload endpoint is retired. Central Command Centre
// handles authenticated files and staff permissions. Never fall back to a
// Cloudflare Worker secret or unscoped object-storage credentials.
const response = async () => Response.json({
  ok:false,
  retired:true,
  error:'Legacy ICA editorial uploads are retired. Use protected Central Command Centre document workflows.',
  commandCentre:'https://ccc-command-centre.vercel.app/signin'
},{ status:410, headers:{ 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff' }})
export const Route = createFileRoute('/api/ica-upload')({
  server:{ handlers:{ POST:response,PUT:response,PATCH:response,DELETE:response } }
} as any)
