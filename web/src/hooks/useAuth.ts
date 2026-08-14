"use client"

import { useState, useEffect, useCallback } from "react"
import { User } from "firebase/auth"
import { MOCK_MODE } from "@/lib/firebase"
import { mockUser } from "@/mocks/users"

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isMock: boolean
}

export interface AuthActions {
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(
    MOCK_MODE
      ? ({ uid: mockUser.id, email: mockUser.email, displayName: mockUser.name } as unknown as User)
      : null
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (MOCK_MODE) return

    // Firebase real
    setLoading(true)
    import("firebase/auth").then(({ onAuthStateChanged }) => {
      import("@/lib/firebase").then(({ auth }) => {
        if (!auth) {
          setLoading(false)
          return
        }
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser)
          setLoading(false)
        })
        // Timeout de segurança
        const timeout = setTimeout(() => setLoading(false), 3000)
        return () => {
          clearTimeout(timeout)
          unsubscribe()
        }
      })
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (MOCK_MODE) return
    setError(null)
    try {
      const { signInWithPopup, GoogleAuthProvider } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")
      if (!auth) return
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (e: any) {
      setError(e.message || "Erro ao fazer login com Google")
    }
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (MOCK_MODE) return
    setError(null)
    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")
      if (!auth) return
      await signInWithEmailAndPassword(auth, email, password)
    } catch (e: any) {
      setError(e.message || "Erro ao fazer login")
    }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (MOCK_MODE) return
    setError(null)
    try {
      const { createUserWithEmailAndPassword } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")
      if (!auth) return
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (e: any) {
      setError(e.message || "Erro ao criar conta")
    }
  }, [])

  const signOut = useCallback(async () => {
    if (MOCK_MODE) return
    setError(null)
    try {
      const { signOut: fbSignOut } = await import("firebase/auth")
      const { auth } = await import("@/lib/firebase")
      if (!auth) return
      await fbSignOut(auth)
    } catch (e: any) {
      setError(e.message || "Erro ao sair")
    }
  }, [])

  return {
    user,
    loading,
    error,
    isMock: MOCK_MODE,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }
}
