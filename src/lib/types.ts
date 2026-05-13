export type GlucoseContext =
  | 'jejum'
  | 'pre_refeicao'
  | 'pos_refeicao'
  | 'antes_dormir'
  | 'outro'

export const CONTEXT_LABELS: Record<GlucoseContext, string> = {
  jejum: 'Jejum',
  pre_refeicao: 'Pré-refeição',
  pos_refeicao: 'Pós-refeição',
  antes_dormir: 'Antes de dormir',
  outro: 'Outro',
}

export type Patient = {
  id: string
  user_id: string
  name: string
  birth_date: string | null
  notes: string | null
  alert_threshold_high: number
  alert_threshold_low: number
  created_at: string
}

export type GlucoseReading = {
  id: string
  patient_id: string
  value_mg_dl: number
  measured_at: string
  context: GlucoseContext
  notes: string | null
  created_at: string
}

export type Meal = {
  id: string
  patient_id: string
  description: string
  eaten_at: string
  linked_reading_id: string | null
  created_at: string
}

export function getGlucoseStatus(
  value: number,
  thresholdHigh: number,
  thresholdLow: number
): 'low' | 'normal' | 'high' {
  if (value < thresholdLow) return 'low'
  if (value > thresholdHigh) return 'high'
  return 'normal'
}

export const STATUS_COLORS = {
  low: { bg: 'bg-yellow-50', text: 'text-yellow-800', badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' },
  normal: { bg: 'bg-green-50', text: 'text-green-800', badge: 'bg-green-100 text-green-800', dot: 'bg-green-400' },
  high: { bg: 'bg-red-50', text: 'text-red-800', badge: 'bg-red-100 text-red-800', dot: 'bg-red-500' },
}

export const STATUS_LABELS = {
  low: 'Baixo',
  normal: 'Normal',
  high: 'Alto',
}
