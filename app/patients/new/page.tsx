'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function NewPatientPage() {
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single()

    if (!profile) {
      setError('No profile found for this user')
      return
    }

    const { error } = await supabase.from('patients').insert({
      tenant_id: profile.tenant_id,
      full_name: fullName,
      date_of_birth: dob || null,
      notes,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/patients')
      router.refresh()
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto' }}>
      <h1>Add Patient</h1>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
          required
        />
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 10, padding: 8 }}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ padding: '8px 16px' }}>Add Patient</button>
      </form>
    </div>
  )
}