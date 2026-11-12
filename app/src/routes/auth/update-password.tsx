import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
export const Route = createFileRoute('/auth/update-password')({head:()=>({meta:[{title:'Set new password | ICA'},{name:'robots',content:'noindex,nofollow'}]}),component:UpdatePassword})
function UpdatePassword(){
 const [password,setPassword]=useState('');const [message,setMessage]=useState('');const [busy,setBusy]=useState(false)
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);try{
 const url=import.meta.env.VITE_ICA_SUPABASE_URL;const key=import.meta.env.VITE_ICA_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)throw new Error('Account recovery is not configured')
 const hash=new URLSearchParams(location.hash.slice(1));const query=new URLSearchParams(location.search)
 const token=hash.get('access_token');const refresh=hash.get('refresh_token');const code=query.get('code')
 let access=token
 if(!access&&code){const verifier=sessionStorage.getItem('ica_auth_code_verifier');if(!verifier)throw new Error('Recovery session expired. Request a new link.')
 const exchanged=await fetch(url+'/auth/v1/token?grant_type=pkce',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({auth_code:code,code_verifier:verifier})});if(!exchanged.ok)throw new Error('Invalid or expired recovery link');access=(await exchanged.json()).access_token}
 if(!access||(!refresh&&!code))throw new Error('Invalid or expired recovery link. Request another.')
 const response=await fetch(url+'/auth/v1/user',{method:'PUT',headers:{apikey:key,Authorization:'Bearer '+access,'Content-Type':'application/json'},body:JSON.stringify({password})})
 if(!response.ok)throw new Error('Password update failed. Request another recovery link.')
 history.replaceState({},'',location.pathname);setMessage('Password updated. You can now sign in.')
 }catch(err){setMessage(err instanceof Error?err.message:'Password update failed')}finally{setBusy(false)}}
 return <main style={{maxWidth:460,margin:'6rem auto',padding:'2rem'}}><h1>Set a new password</h1><form onSubmit={submit}><label htmlFor="new-password">New password (12 characters minimum)</label><input id="new-password" type="password" minLength={12} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} style={{display:'block',width:'100%',padding:12,margin:'1rem 0'}}/><button disabled={busy}>Update password</button></form><p role="status">{message}</p></main>
}
