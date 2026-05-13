import Link from 'next/link'
import { format, subDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/server'
import { getGlucoseStatus, STATUS_COLORS, STATUS_LABELS, CONTEXT_LABELS } from '@/lib/types'
import { GlucoseChart } from './GlucoseChart'

const PERIOD_OPTIONS = [
  { dias: 7, label: '7 dias' },
  { dias: 15, label: '15 dias' },
  { dias: 30, label: '30 dias' },
]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>
}) {
  const params = await searchParams
  const dias = parseInt(params.dias ?? '7', 10)
  const validDias = [7, 15, 30].includes(dias) ? dias : 7

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('user_id', user!.id)
    .single()

  const since = subDays(new Date(), validDias).toISOString()

  const { data: readings } = await supabase
    .from('glucose_readings')
    .select('*')
    .eq('patient_id', patient?.id)
    .gte('measured_at', since)
    .order('measured_at', { ascending: true })

  const allReadings = readings ?? []

  const avg = allReadings.length
    ? Math.round(allReadings.reduce((s, r) => s + r.value_mg_dl, 0) / allReadings.length)
    : null
  const max = allReadings.length ? Math.max(...allReadings.map((r) => r.value_mg_dl)) : null
  const min = allReadings.length ? Math.min(...allReadings.map((r) => r.value_mg_dl)) : null
  const lastReading = allReadings.length ? allReadings[allReadings.length - 1] : null
  const recent = [...allReadings].reverse().slice(0, 5)

  const thresholdHigh = patient?.alert_threshold_high ?? 180
  const thresholdLow = patient?.alert_threshold_low ?? 70

  const lastStatus = lastReading
    ? getGlucoseStatus(lastReading.value_mg_dl, thresholdHigh, thresholdLow)
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {patient?.name ?? 'Paciente'}
          </h1>
          <p className="text-sm text-slate-500 capitalize">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        {lastReading && lastStatus && (
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${STATUS_COLORS[lastStatus].bg}`}>
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[lastStatus].dot}`} />
            <span className={`text-sm font-semibold ${STATUS_COLORS[lastStatus].text}`}>
              {lastReading.value_mg_dl} mg/dL
            </span>
          </div>
        )}
      </div>

      {/* Seletor de período */}
      <div className="flex gap-2 mb-5">
        {PERIOD_OPTIONS.map(({ dias: d, label }) => (
          <Link
            key={d}
            href={`/dashboard?dias=${d}`}
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

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard label="Média" value={avg ? `${avg}` : '—'} unit="mg/dL"
          color={avg ? getGlucoseStatus(avg, thresholdHigh, thresholdLow) : undefined} />
        <StatCard label="Máximo" value={max ? `${max}` : '—'} unit="mg/dL"
          color={max ? getGlucoseStatus(max, thresholdHigh, thresholdLow) : undefined} />
        <StatCard label="Mínimo" value={min ? `${min}` : '—'} unit="mg/dL"
          color={min ? getGlucoseStatus(min, thresholdHigh, thresholdLow) : undefined} />
        <StatCard label="Medições" value={`${allReadings.length}`} />
      </div>

      {/* Gráfico */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-700">Histórico de glicemia</h2>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-3 border-t-2 border-dashed border-red-400 inline-block" />
              Alto ({thresholdHigh})
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 border-t-2 border-dashed border-yellow-400 inline-block" />
              Baixo ({thresholdLow})
            </span>
          </div>
        </div>
        <GlucoseChart
          data={allReadings}
          thresholdHigh={thresholdHigh}
          thresholdLow={thresholdLow}
        />
      </div>

      {/* Últimas medições */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Últimas medições</h2>
          <Link href="/historico" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
            Ver todas
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-slate-400 text-sm">Nenhuma medição registrada</p>
            <Link
              href="/nova-medicao"
              className="mt-3 inline-block text-sm text-emerald-600 font-medium hover:text-emerald-700"
            >
              Registrar primeira medição →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((r) => {
              const status = getGlucoseStatus(r.value_mg_dl, thresholdHigh, thresholdLow)
              return (
                <li key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[status].dot}`} />
                    <div>
                      <span className={`text-base font-semibold ${STATUS_COLORS[status].text}`}>
                        {r.value_mg_dl} mg/dL
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {CONTEXT_LABELS[r.context as keyof typeof CONTEXT_LABELS]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      {format(parseISO(r.measured_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <span className={`text-xs font-medium ${STATUS_COLORS[status].text}`}>
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Botão flutuante de nova medição — mobile */}
      <div className="h-4" />
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  color,
}: {
  label: string
  value: string
  unit?: string
  color?: 'low' | 'normal' | 'high'
}) {
  const textColor = color ? STATUS_COLORS[color].text : 'text-slate-700'
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-3 py-3">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${textColor}`}>{value}</p>
      {unit && <p className="text-xs text-slate-400">{unit}</p>}
    </div>
  )
}
