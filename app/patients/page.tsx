import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeleteButton from './DeleteButton'

export default async function PatientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  const { data: patients, error } = await supabase
    .from('patients')
    .select('*')

  // Log the view event (fire-and-forget, don't block the page on this)
  if (profile) {
    supabase.from('audit_log').insert({
      tenant_id: profile.tenant_id,
      actor_id: user.id,
      action: 'select',
      table_name: 'patients',
      details: { count: patients?.length ?? 0 },
    }).then()
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h1>Patients</h1>
      <p>Logged in as: {user.email} ({profile?.role})</p>
      <Link href="/patients/new">+ Add Patient</Link>
      {isAdmin && <> | <Link href="/audit-log">View Audit Log</Link></>}
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      <ul>
        {patients?.map((p) => (
          <li key={p.id} style={{ marginBottom: 8 }}>
            {p.full_name} — {p.date_of_birth}
            {isAdmin && <DeleteButton patientId={p.id} />}
          </li>
        ))}
      </ul>
    </div>
  )
}