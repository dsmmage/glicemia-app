'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { updatePatientSettings } from '@/app/actions/patient'
import { createClient } from '@/lib/supabase/client'
import type { Patient } from '@/lib/types'

export default function ConfiguracoesPage() {
  const [state, action, pending] = useActionState(updatePatientSettings, undefined)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          setPatient(data)
          setLoading(false)
        })
    })
  }, [state])

  if (loading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-40" />
          <div className="h-40 bg-slate-200 rounded-2xl" />
        </div>
      </div>
    )
  }

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
        <h1 className="text-xl font-bold text-slate-900">Configurações</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <form action={action} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              Nome do paciente
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={patient?.name ?? ''}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
              placeholder="Nome do paciente"
            />
          </div>

          <div className="pt-1 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-1">Limites de alerta de glicemia</p>
            <p className="text-xs text-slate-400 mb-4">
              Você será alertado quando os valores estiverem fora desses limites.
              Consulte seu médico para definir os valores ideais.
            </p>

            <div className="space-y-4">
              <div>
                <label htmlFor="alertHigh" className="block text-sm font-medium text-slate-700 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    Limite alto (hiperglicemia)
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="alertHigh"
                    name="alertHigh"
                    type="number"
                    min="100"
                    max="400"
                    defaultValue={patient?.alert_threshold_high ?? 180}
                    required
                    className="w-full pl-3 pr-16 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                    mg/dL
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Padrão: 180 mg/dL. Entre 100 e 400.</p>
              </div>

              <div>
                <label htmlFor="alertLow" className="block text-sm font-medium text-slate-700 mb-1">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                    Limite baixo (hipoglicemia)
                  </span>
                </label>
                <div className="relative">
                  <input
                    id="alertLow"
                    name="alertLow"
                    type="number"
                    min="40"
                    max="100"
                    defaultValue={patient?.alert_threshold_low ?? 70}
                    required
                    className="w-full pl-3 pr-16 py-2.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                    mg/dL
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Padrão: 70 mg/dL. Entre 40 e 100.</p>
              </div>
            </div>
          </div>

          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-700">
              Configurações salvas com sucesso!
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium text-base hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </form>
      </div>

      {/* Informação sobre valores de referência */}
      <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-emerald-800 mb-2">Valores de referência (mg/dL)</p>
        <ul className="text-xs text-emerald-700 space-y-1">
          <li>· Normal em jejum: 70 – 99</li>
          <li>· Pré-diabetes em jejum: 100 – 125</li>
          <li>· Hiperglicemia pós-refeição: acima de 180</li>
          <li>· Hipoglicemia: abaixo de 70</li>
          <li>· Hipoglicemia grave: abaixo de 54</li>
        </ul>
        <p className="text-xs text-emerald-600 mt-2 italic">
          Consulte sempre seu médico para definir os limites ideais para seu caso.
        </p>
      </div>
    </div>
  )
}
