"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoImage from "@/app/assets/Logo.jpeg";
import { signup } from "@/app/actions/auth";

export default function RegistroPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <Image src={logoImage} alt="ClickCargo" width={200} height={67} className="mx-auto" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Crear cuenta
          </h2>

          <form action={action} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre completo / Empresa
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                placeholder="Tu nombre o razón social"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Soy...
              </label>
              <select
                id="role"
                name="role"
                required
                defaultValue=""
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent bg-white"
              >
                <option value="" disabled>
                  Seleccioná tu tipo de cuenta
                </option>
                <option value="EMPRESA">
                  Empresa de transporte / Cargador
                </option>
                <option value="TRANSPORTISTA">Transportista / Camionero</option>
              </select>
            </div>

            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-brand-navy hover:bg-brand-navy-dark disabled:opacity-60 text-white font-medium rounded-lg py-2.5 transition-colors"
            >
              {pending ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/login"
              className="text-brand-navy hover:text-brand-navy-dark font-medium"
            >
              Ingresá
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
