"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"

export default function LoginPage() {
  const router = useRouter()
  const { signInWithGoogle, signInWithEmail, error, isMock } = useAuth()

  const handleGoogleLogin = async () => {
    if (isMock) {
      router.push("/onboarding")
      return
    }
    await signInWithGoogle()
    router.push("/dashboard")
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isMock) {
      router.push("/dashboard")
      return
    }
    const form = e.target as HTMLFormElement
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    await signInWithEmail(email, password)
    if (!error) {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background accent glow */}
      <div className="fixed top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="glass-card p-10">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white mb-2">ProMatch<span className="text-accent">.</span></h1>
            <p className="text-surface-800 text-lg">
              Encontre vagas que combinam com você
            </p>
            {isMock && (
              <p className="text-xs text-accent mt-3 bg-accent-glow rounded-lg px-3 py-1.5 inline-block border border-accent/20">
                Modo demo
              </p>
            )}
          </div>

          {/* Erro */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Google login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-surface-100 border border-dark-border rounded-xl px-4 py-3.5 text-sm font-medium text-white hover:border-surface-500 hover:bg-surface-200 transition-all duration-200 mb-8"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com Google
          </button>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-dark-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-dark-card text-surface-700">ou</span>
            </div>
          </div>

          {/* Email login */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-800 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                className="input-dark"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-800 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="input-dark"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Entrar
            </button>
          </form>

          <p className="text-center text-xs text-surface-700 mt-8">
            Ao entrar, você concorda com nossos Termos de Uso
          </p>
        </div>
      </div>
    </div>
  )
}
