import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { clinicName } = await request.json()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const admin = createAdminClient()

  // Prevent a user who already has a profile from creating a second clinic
  const { data: existingProfile } = await admin
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (existingProfile) {
    return NextResponse.json({ error: 'You already belong to a clinic' }, { status: 400 })
  }

  const { data: tenant, error: tenantError } = await admin
    .from('tenants')
    .insert({ name: clinicName })
    .select()
    .single()

  if (tenantError) {
    return NextResponse.json({ error: tenantError.message }, { status: 500 })
  }

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: user.id, tenant_id: tenant.id, role: 'admin' })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}