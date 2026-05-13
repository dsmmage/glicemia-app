import Link from 'next/link'
import { format, parseISO, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { getGlucoseStatus, STATUS_COLORS, STATUS_LABELS, CONTEXT_LABELS } from '@/lib/types'
import { deleteGlucoseReading } from '@/app/actions/glucose'

const PERIOD_OPTIONS = [
  { dias: 7, label: '7 dias' },
  { dias: 15, label: '15 dias' },
  { dias: 30, label: '30 dias' },
  { dias: 90, label: '3 meses' },
]

export default async function HistoricoPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>
}) {
  const params = await searchParams
  const dias = parseInt(params.dias ?? '30', 10)
  const validDias = [7, 15, 30, 90].includes(dias) ? dias : 30

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: patient } = await supabase
    .from('patients')
    .select('id, alert_threshold_high, alert_threshold_low')
    .eq('user_id', user!.id)
    .single()

  const since = subDays(new Date(), validDias).toISOString()

  const { data: readings } = await supabase
    .from('glucose_readings')
    .select('*')
    .eq('patient_id', patient?.id)
    .gte('measured_at', since)
    .order('measured_at', { ascending: false })

  const allReadings = readings ?? []
  const thresholdHigh = patient?.alert_threshold_high ?? 180
  const thresholdLow = patient?.alert_threshold_low ?? 70

  // Agrupar por data
  const grouped = allReadings.reduce<Record<string, typeof allReadings>>((acc, r) => {
    const dateKey = format(parseISO(r.measured_at), 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(r)
    return acc
  }, {})

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          aria-label="Voltar ao painel"
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          <svg aria-hidden="true" className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-slate-900">Histórico</h1>
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {PERIOD_OPTIONS.map(({ dias: d, label }) => (
          <Link
            key={d}
            href={`/historico?dias=${d}`}
            aria-current={validDias === d ? 'page' : undefined}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              validDias === d
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Resumo do período */}
      {allReadings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 mb-5 flex gap-6 text-sm">
          <span className="text-slate-500">
            <strong className="text-slate-800">{allReadings.length}</strong> medições
          </span>
          <span className="text-red-500">
            <strong>{allReadings.filter(r => getGlucoseStatus(r.value_mg_dl, thresholdHigh, thresholdLow) === 'high').length}</strong> altas
          </span>
          <span className="text-yellow-600">
            <strong>{allReadings.filter(r => getGlucoseStatus(r.value_mg_dl, thresholdHigh, thresholdLow) === 'low').length}</strong> baixas
          </span>
          <span className="text-green-600">
            <strong>{allReadings.filter(r => getGlucoseStatus(r.value_mg_dl, thresholdHigh, thresholdLow) === 'normal').length}</strong> normais
          </span>
        </div>
      )}

      {allReadings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 px-4 py-12 text-center">
          <p className="text-slate-400 text-sm">Nenhuma medição no período selecionado</p>
          <Link
            href="/nova-medicao"
            className="mt-3 inline-block text-sm text-emerald-600 font-medium hover:text-emerald-700"
          >
            Registrar medição →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([dateKey, dayReadings]) => (
            <div key={dateKey} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  {format(parseISO(dateKey), "EEEE, d 'de' MMMM", { locale: ptBR })}
                </p>
              </div>
              <ul className="divide-y divide-slate-100">
                {dayReadings.map((r) => {
                  const status = getGlucoseStatus(r.value_mg_dl, thresholdHigh, thresholdLow)
                  return (
                    <li key={r.id} className="flex items-center justify-between px-4 py-3 group">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_COLORS[status].dot}`} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-base font-bold ${STATUS_COLORS[status].text}`}>
                              {r.value_mg_dl} mg/dL
                            </span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${STATUS_COLORS[status].badge}`}>
                              {STATUS_LABELS[status]}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {format(parseISO(r.measured_at), 'HH:mm', { locale: ptBR })}
                            {' · '}
                            {CONTEXT_LABELS[r.context as keyof typeof CONTEXT_LABELS]}
                            {r.notes && ` · ${r.notes}`}
                          </p>
                        </div>
                      </div>
                      <form action={deleteGlucoseReading.bind(null, r.id)}>
                        <button
                          type="submit"
                          aria-label="Excluir medição"
                          className="ml-2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
