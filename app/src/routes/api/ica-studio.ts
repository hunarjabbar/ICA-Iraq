import { createFileRoute } from '@tanstack/react-router'
import {icaStaffHandoff} from '../../lib/central-workspace'

/** Legacy ICA editor-key login is permanently retired. Staff sign in only through the
 * independent CCC Central Command Centre with real Supabase staff authorization. */
const commandCentre = icaStaffHandoff('editorial')
const headers = { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' }
const get = async () => Response.json({
 active:false,
 configured:false,
 retired:true,
 commandCentre,
 message:'The ICA legacy editorial console has been retired. Use the CCC Central Command Centre.'
}, {headers})
const post = async () => Response.json({
 ok:false,
 retired:true,
 commandCentre,
 error:'Legacy editorial authentication and mutations are no longer available here.'
}, {status:410,headers})
export const Route = createFileRoute('/api/ica-studio')({
 server:{ handlers:{ GET:get, POST:post, PUT:post, PATCH:post, DELETE:post }}
} as any)
