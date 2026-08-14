"use client"

import { useState, useEffect, useCallback } from "react"
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
} from "firebase/auth"
import { auth, MOCK_MODE } from "@/lib/firebase"
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

/**
 * Hook de autenticação — usa Firebase Auth se configurado, mock caso contrário.
 */
export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (MOCK_MODE) {
      // Mock: simula usuário autenticado
      setUser({
        uid: mockUser.id,
        email: mockUser.email,
        displayName: mockUser.name,
      } as unknown as User)
      setLoading(false)
      return
    }

    // Firebase: escuta mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth!, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (MOCK_MODE) return
    setError(null)
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth!, provider)
    } catch (e: any) {
      setError(e.message || "Erro ao fazer login com Google")
    }
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    if (MOCK_MODE) return
    setError(null)
    try {
      await signInWithEmailAndPassword(auth!, email, password)
    } catch (e: any) {
      setError(e.message || "Erro ao fazer login")
    }
  }, [])

  const signUpWithEmail = useCallback(async (email: string, password: string) => {
    if (MOCK_MODE) return
    setError(null)
    try {
      await createUserWithEmailAndPassword(auth!, email, password)
    } catch (e: any) {
      setError(e.message || "Erro ao criar conta")
    }
  }, [])

  const signOut = useCallback(async () => {
    if (MOCK_MODE) return
    setError(null)
    try {
      await firebaseSignOut(auth!)
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
