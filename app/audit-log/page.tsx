import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AuditLogPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return <p style={{ margin: 40 }}>Admins only.</p>
  }

  const { data: logs, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div style={{ maxWidth: 800, margin: '40px auto' }}>
      <h1>Audit Log</h1>
      {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>
            <th>When</th>
            <th>Action</th>
            <th>Table</th>
            <th>Record</th>
          </tr>
        </thead>
        <tbody>
          {logs?.map((log) => (
            <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>{new Date(log.created_at).toLocaleString()}</td>
              <td>{log.action}</td>
              <td>{log.table_name}</td>
              <td>{log.record_id ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}