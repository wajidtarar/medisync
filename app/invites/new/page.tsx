'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewInvitePage() {
  const [code, setCode] = useState('')
  const [role, setRole] = useState('clinician')
  const [error, setError] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const supabase = createClient()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles').select('tenant_id, role').eq('id', user.id).single()

    if (!profile) return

    const newCode = code || Math.random().toString(36).substring(2, 10).toUpperCase()

    const { error } = await supabase.from('invites').insert({
      tenant_id: profile.tenant_id,
      code: newCode,
      role,
      created_by: user.id,
    })

    if (error) {
      setError(error.message)
    } else {
      setGeneratedCode(newCode)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h1>Invite a Teammate</h1>
      <form onSubmit={handleCreate}>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={{ display: 'block', marginBottom: 10 }}>
          <option value="clinician">Clinician</option>
          <option value="admin">Admin</option>
        </select>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>Generate Invite Code</button>
      </form>
      {generatedCode && <p>Share this code: <strong>{generatedCode}</strong></p>}
    </div>
  )
}