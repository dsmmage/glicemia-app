'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { GlucoseContext } from '@/lib/types'

async function getPatientId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing?.id) return existing.id

  // Registro criado na confirmação de e-mail — garante que o paciente existe
  const { data: created } = await supabase
    .from('patients')
    .insert({ user_id: user.id, name: 'Paciente' })
    .select('id')
    .single()

  return created?.id ?? null
}

export async function addGlucoseReading(
  prevState: { error: string } | undefined,
  formData: FormData
) {
  const patientId = await getPatientId()
  if (!patientId) return { error: 'Usuário não autenticado.' }

  const valueStr = formData.get('value') as string
  const value = parseInt(valueStr, 10)
  const context = formData.get('context') as GlucoseContext
  const notes = formData.get('notes') as string
  const measuredAt = formData.get('measuredAt') as string

  if (!value || isNaN(value)) {
    return { error: 'Informe um valor de glicemia válido.' }
  }

  if (value < 20 || value > 600) {
    return { error: 'O valor deve estar entre 20 e 600 mg/dL.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('glucose_readings').insert({
    patient_id: patientId,
    value_mg_dl: value,
    context: context || 'outro',
    notes: notes || null,
    measured_at: measuredAt || new Date().toISOString(),
  })

  if (error) {
    return { error: 'Erro ao salvar medição. Tente novamente.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/historico')
  redirect('/dashboard')
}

export async function deleteGlucoseReading(id: string) {
  const patientId = await getPatientId()
  if (!patientId) return

  const supabase = await createClient()
  await supabase
    .from('glucose_readings')
    .delete()
    .eq('id', id)
    .eq('patient_id', patientId)

  revalidatePath('/dashboard')
  revalidatePath('/historico')
}
