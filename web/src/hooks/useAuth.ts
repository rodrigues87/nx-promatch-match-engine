"use client"

import { useState, useEffect, useCallback } from "react"
import { mockUser } from "@/mocks/users"

interface MockUserType {
  uid: string
  email: string
  displayName: string
}

export interface AuthState {
  user: MockUserType | null
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
  const [user, setUser] = useState<MockUserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Mock mode: simula user autenticado
    setUser({
      uid: mockUser.id,
      email: mockUser.email,
      displayName: mockUser.name,
    })
    setLoading(false)
  }, [])

  const signInWithGoogle = useCallback(async () => {}, [])
  const signInWithEmail = useCallback(async () => {}, [])
  const signUpWithEmail = useCallback(async () => {}, [])
  const signOut = useCallback(async () => {}, [])

  return {
    user,
    loading,
    error,
    isMock: true,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }
}
