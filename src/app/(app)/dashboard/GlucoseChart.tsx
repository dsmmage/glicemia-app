'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type DataPoint = {
  measured_at: string
  value_mg_dl: number
}

type Props = {
  data: DataPoint[]
  thresholdHigh: number
  thresholdLow: number
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  const isHigh = value > 180
  const isLow = value < 70
  const color = isHigh ? '#ef4444' : isLow ? '#f59e0b' : '#10b981'

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className="font-bold" style={{ color }}>{value} mg/dL</p>
    </div>
  )
}

export function GlucoseChart({ data, thresholdHigh, thresholdLow }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
        Nenhuma medição no período selecionado
      </div>
    )
  }

  const chartData = data.map((d) => ({
    time: format(parseISO(d.measured_at), 'dd/MM HH:mm', { locale: ptBR }),
    value: d.value_mg_dl,
  }))

  return (
    <div role="img" aria-label={`Gráfico de glicemia com ${data.length} medições`}>
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="time"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={thresholdHigh} stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1.5} />
        <ReferenceLine y={thresholdLow} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#059669"
          strokeWidth={2}
          dot={{ r: 3, fill: '#2563eb', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
    </div>
  )
}
