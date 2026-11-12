import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/auth/verify')({
  head: () => ({ meta: [{ title: 'Verify email | ICA' }, { name: 'robots', content: 'noindex,nofollow' }] }),
  component: VerifyEmail,
})

function VerifyEmail() {
  const [message, setMessage] = useState('Verifying your email address…')
  useEffect(() => {
    let active = true
    async function verify() {
      try {
        const query = new URLSearchParams(window.location.search)
        const tokenHash = query.get('token_hash')
        const type = query.get('type')
        window.history.replaceState({}, '', window.location.pathname)
        if (!tokenHash || type !== 'email') throw new Error('Invalid verification link. Request another email.')
        const url = import.meta.env.VITE_ICA_SUPABASE_URL
        const key = import.meta.env.VITE_ICA_SUPABASE_PUBLISHABLE_KEY
        if (!url || !key) throw new Error('Verification is temporarily unavailable.')
        const response = await fetch(url.replace(/\/$/, '') + '/auth/v1/verify', {
          method: 'POST',
          headers: { apikey: key, 'Content-Type': 'application/json' },
          body: JSON.stringify({ token_hash: tokenHash, type: 'email' }),
        })
        if (!response.ok) throw new Error('Verification link expired or already used. Request another email.')
        if (active) setMessage('Your email has been verified. You can now sign in.')
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Verification failed.')
      }
    }
    void verify()
    return () => { active = false }
  }, [])
  return <main style={{maxWidth:460,margin:'6rem auto',padding:'2rem'}}><h1>ICA email verification</h1><p role="status">{message}</p><a href="/">Return to ICA</a></main>
}
