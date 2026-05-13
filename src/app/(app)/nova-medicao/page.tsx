'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { addGlucoseReading } from '@/app/actions/glucose'
import { format } from 'date-fns'
import type { GlucoseContext } from '@/lib/types'

const CONTEXTS: { value: GlucoseContext; label: string }[] = [
  { value: 'jejum', label: 'Jejum' },
  { value: 'pre_refeicao', label: 'Pré-refeição' },
  { value: 'pos_refeicao', label: 'Pós-refeição' },
  { value: 'antes_dormir', label: 'Antes de dormir' },
  { value: 'outro', label: 'Outro' },
]

export default function NovaMedicaoPage() {
  const [state, action, pending] = useActionState(addGlucoseReading, undefined)

  const now = new Date()
  const defaultDatetime = format(now, "yyyy-MM-dd'T'HH:mm")

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
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
        <h1 className="text-xl font-bold text-slate-900">Nova Medição</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <form action={action} className="space-y-5">
          {/* Valor */}
          <div>
            <label htmlFor="value" className="block text-sm font-medium text-slate-700 mb-2">
              Glicemia (mg/dL)
            </label>
            <div className="relative">
              <input
                id="value"
                name="value"
                type="number"
                min="20"
                max="600"
                step="1"
                required
                className="w-full px-4 py-4 rounded-xl border border-slate-300 text-slate-900 text-3xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="0"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                mg/dL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Valores entre 20 e 600</p>
          </div>

          {/* Data e hora */}
          <div>
            <label htmlFor="measuredAt" className="block text-sm font-medium text-slate-700 mb-2">
              Data e hora da medição
            </label>
            <input
              id="measuredAt"
              name="measuredAt"
              type="datetime-local"
              defaultValue={defaultDatetime}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
            />
          </div>

          {/* Contexto */}
          <fieldset className="border-0 p-0 m-0">
            <legend className="block text-sm font-medium text-slate-700 mb-2">Momento</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CONTEXTS.map(({ value, label }) => (
                <label
                  key={value}
                  className="relative cursor-pointer"
                >
                  <input
                    type="radio"
                    name="context"
                    value={value}
                    defaultChecked={value === 'outro'}
                    className="sr-only peer"
                  />
                  <span className="block px-3 py-2.5 rounded-lg border border-slate-200 text-sm text-center text-slate-600 font-medium peer-checked:border-emerald-600 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 hover:bg-slate-50 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Notas */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-2">
              Observações <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base resize-none"
              placeholder="Ex: após almoço, estava se sentindo bem..."
            />
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-semibold text-base hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Salvando...' : 'Salvar medição'}
          </button>
        </form>
      </div>
    </div>
  )
}
