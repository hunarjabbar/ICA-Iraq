import { createFileRoute } from '@tanstack/react-router'
import {icaStaffHandoff} from '../../lib/central-workspace'

// Old standalone ICA media-upload endpoint is retired. Central Command Centre
// handles authenticated files and staff permissions. Never fall back to a
// Cloudflare Worker secret or unscoped object-storage credentials.
const response = async () => Response.json({
  ok:false,
  retired:true,
  error:'Legacy ICA editorial uploads are retired. Use protected Central Command Centre document workflows.',
  commandCentre:icaStaffHandoff('editorial')
},{ status:410, headers:{ 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff' }})
export const Route = createFileRoute('/api/ica-upload')({
  server:{ handlers:{ POST:response,PUT:response,PATCH:response,DELETE:response } }
} as any)
