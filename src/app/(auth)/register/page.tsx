'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { register } from '@/app/actions/auth'

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined)

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 mb-4">
            <svg aria-hidden="true" className="w-9 h-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11v3m-1.5-1.5h3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">GlicApp</h1>
          <p className="text-slate-500 text-sm mt-1">Acompanhamento de glicemia</p>
        </div>

        {state?.email ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg aria-hidden="true" className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-slate-800 mb-2">Confirme seu e-mail</h2>
            <p className="text-sm text-slate-500 mb-1">
              Enviamos um link de confirmação para:
            </p>
            <p className="text-sm font-medium text-slate-800 mb-4">{state.email}</p>
            <p className="text-sm text-slate-500">
              Clique no link do e-mail e depois volte aqui para entrar.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block w-full py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium text-base hover:bg-emerald-700 text-center transition-colors"
            >
              Ir para o login
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-5">Criar conta</h2>

            <form action={action} className="space-y-4">
              <div>
                <label htmlFor="patientName" className="block text-sm font-medium text-slate-700 mb-1">
                  Nome do paciente monitorado
                </label>
                <input
                  id="patientName"
                  name="patientName"
                  type="text"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                  placeholder="Ex: Maria Silva"
                />
                <p className="text-xs text-slate-400 mt-1">Pode alterar depois nas configurações</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  E-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-base"
                  placeholder="Mínimo 6 caracteres"
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
                className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 text-white font-medium text-base hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {pending ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-4">
          Já tem conta?{' '}
          <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-700">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
