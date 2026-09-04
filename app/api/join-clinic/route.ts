import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { inviteCode } = await request.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: invite, error: inviteError } = await admin
    .from('invites')
    .select('*')
    .eq('code', inviteCode)
    .eq('used', false)
    .maybeSingle()

  if (inviteError || !invite) {
    return NextResponse.json({ error: 'Invalid or already-used invite code' }, { status: 400 })
  }

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: user.id, tenant_id: invite.tenant_id, role: invite.role })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  await admin.from('invites').update({ used: true }).eq('id', invite.id)

  return NextResponse.json({ success: true })
}