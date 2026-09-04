'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [mode, setMode] = useState<'new' | 'join'>('new')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [clinicName, setClinicName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const endpoint = mode === 'new' ? '/api/setup-clinic' : '/api/join-clinic'
    const body = mode === 'new' ? { clinicName } : { inviteCode }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const result = await res.json()

    if (!res.ok) {
      setError(result.error)
      return
    }

    router.push('/patients')
    router.refresh()
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h1>Sign up for MediSync</h1>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setMode('new')} disabled={mode === 'new'}>New Clinic</button>{' '}
        <button onClick={() => setMode('join')} disabled={mode === 'join'}>Join with Invite</button>
      </div>
      <form onSubmit={handleSignup}>
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        <input
          type="password" placeholder="Password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        {mode === 'new' ? (
          <input
            placeholder="Clinic name" value={clinicName}
            onChange={(e) => setClinicName(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
          />
        ) : (
          <input
            placeholder="Invite code" value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
          />
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>Sign up</button>
      </form>
    </div>
  )
}