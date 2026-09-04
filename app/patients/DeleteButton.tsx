'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeleteButton({ patientId }: { patientId: string }) {
  const router = useRouter()
  const supabase = createClient()


  async function handleDelete() {
    if (!confirm('Delete this patient?')) return
    const { error, count } = await supabase
      .from('patients')
      .delete({ count: 'exact' })
      .eq('id', patientId)

    if (error) {
      alert('Error: ' + error.message)
    } else if (count === 0) {
      alert('Delete blocked — 0 rows affected (likely an RLS policy mismatch)')
    } else {
      router.refresh()
    }
  }


  return (
    <button onClick={handleDelete} style={{ marginLeft: 10, color: 'red' }}>
      Delete
    </button>
  )
}