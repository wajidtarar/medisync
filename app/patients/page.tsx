import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h1>Patients</h1>
      <p>Logged in as: {user.email}</p>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      <ul>
        {patients?.map((p) => (
          <li key={p.id}>{p.full_name} — {p.date_of_birth}</li>
        ))}
      </ul>
    </div>
  )
}