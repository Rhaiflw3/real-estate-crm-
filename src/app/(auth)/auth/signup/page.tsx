"use client"

import Link from 'next/link'

export default function SignupPage() {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-slate-900 py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-800">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <h2 className="text-center text-3xl font-bold text-white tracking-tight">
            Registro cerrado
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            El registro público no está disponible
          </p>
        </div>

        <div className="bg-amber-900/30 border border-amber-500/30 text-amber-200 px-4 py-6 rounded-lg text-sm text-center">
          <svg className="w-10 h-10 mx-auto mb-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
          </svg>
          <p className="font-medium mb-1">Solo por invitación</p>
          <p className="text-amber-300/70">
            Este CRM es de uso privado. Si necesitas acceso, contacta al administrador para que te invite.
          </p>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-blue-500 hover:text-blue-400 font-medium transition-colors text-sm"
          >
            ← Volver a iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
