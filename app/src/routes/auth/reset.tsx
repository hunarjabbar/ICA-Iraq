import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/auth/reset')({
  head: () => ({ meta: [{ title: 'Reset password | ICA' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: ResetPassword,
})

function ResetPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const url = import.meta.env.VITE_ICA_SUPABASE_URL
      const key = import.meta.env.VITE_ICA_SUPABASE_PUBLISHABLE_KEY
      if (!url || !key) throw new Error('Account recovery is temporarily unavailable. Contact support.')
      const response = await fetch(url.replace(/\/$/, '') + '/auth/v1/recover', {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, gotrue_meta_security: {}, redirect_to: location.origin + '/auth/update-password' }),
      })
      if (!response.ok && response.status !== 429) throw new Error('Recovery request could not be processed. Please try again.')
      setMessage('If an account exists for this address, recovery instructions will be sent.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Recovery unavailable.')
    } finally { setBusy(false) }
  }
  return <main style={{maxWidth:460,margin:'6rem auto',padding:'2rem'}}><h1>Recover your ICA account</h1><p>Enter your registered email address.</p><form onSubmit={submit}><label htmlFor="recovery-email">Email address</label><input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} style={{display:'block',width:'100%',padding:12,margin:'1rem 0'}}/><button disabled={busy} type="submit">{busy?'Sending…':'Send recovery link'}</button></form><p role="status">{message}</p></main>
}
