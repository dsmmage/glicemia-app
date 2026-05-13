'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updatePatientSettings(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuário não autenticado.' }

  const name = formData.get('name') as string
  const alertHigh = parseInt(formData.get('alertHigh') as string, 10)
  const alertLow = parseInt(formData.get('alertLow') as string, 10)

  if (!name?.trim()) return { error: 'Informe o nome do paciente.' }
  if (isNaN(alertHigh) || alertHigh < 100 || alertHigh > 400) {
    return { error: 'Limite alto deve estar entre 100 e 400 mg/dL.' }
  }
  if (isNaN(alertLow) || alertLow < 40 || alertLow > 100) {
    return { error: 'Limite baixo deve estar entre 40 e 100 mg/dL.' }
  }
  if (alertLow >= alertHigh) {
    return { error: 'O limite baixo deve ser menor que o limite alto.' }
  }

  const { data: existing } = await supabase
    .from('patients')
    .select('id')
    .eq('user_id', user.id)
    .single()

  let error
  if (existing) {
    ;({ error } = await supabase
      .from('patients')
      .update({
        name: name.trim(),
        alert_threshold_high: alertHigh,
        alert_threshold_low: alertLow,
      })
      .eq('user_id', user.id))
  } else {
    ;({ error } = await supabase.from('patients').insert({
      user_id: user.id,
      name: name.trim(),
      alert_threshold_high: alertHigh,
      alert_threshold_low: alertLow,
    }))
  }

  if (error) return { error: 'Erro ao salvar configurações.' }

  revalidatePath('/configuracoes')
  revalidatePath('/dashboard')
  return { success: true }
}
