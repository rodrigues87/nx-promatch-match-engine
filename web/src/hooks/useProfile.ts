"use client"

import { useState, useEffect, useCallback } from "react"
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage, MOCK_MODE } from "@/lib/firebase"
import { mockUser, MockUser } from "@/mocks/users"
import { useAuth } from "./useAuth"

export interface UseProfileReturn {
  profile: MockUser | null
  loading: boolean
  error: string | null
  updateProfile: (data: Partial<MockUser>) => Promise<void>
  updateSkills: (skills: string[]) => Promise<void>
  uploadResume: (file: File) => Promise<string[]>
}

/**
 * Hook para perfil do usuário — Firestore ou mock.
 */
export function useProfile(): UseProfileReturn {
  const { user } = useAuth()
  const [profile, setProfile] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (MOCK_MODE) {
      setProfile(mockUser)
      setLoading(false)
      return
    }

    if (!user || !db) {
      // Não logado: usa mock para preview (não bloqueia UX)
      setProfile(mockUser)
      setLoading(false)
      return
    }

    // Busca perfil do Firestore
    const fetchProfile = async () => {
      try {
        const docRef = doc(db!, "users", user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as unknown as MockUser)
        } else {
          // Primeiro acesso: perfil ainda não existe
          setProfile(null)
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const updateProfile = useCallback(
    async (data: Partial<MockUser>) => {
      if (MOCK_MODE) {
        setProfile((prev) => (prev ? { ...prev, ...data } : null))
        return
      }

      if (!user || !db) return

      const docRef = doc(db!, "users", user.uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() })
      } else {
        await setDoc(docRef, {
          ...data,
          id: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }

      setProfile((prev) => (prev ? { ...prev, ...data } : (data as MockUser)))
    },
    [user],
  )

  const updateSkills = useCallback(
    async (skills: string[]) => {
      await updateProfile({ skills })
    },
    [updateProfile],
  )

  const uploadResume = useCallback(
    async (file: File): Promise<string[]> => {
      if (MOCK_MODE) {
        // Mock: simula parsing de CV e retorna skills fictícias
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(["Java", "Spring Boot", "SQL", "Docker", "Git", "Angular", "TypeScript"])
          }, 2000)
        })
      }

      if (!user || !storage || !db) return []

      // Upload do arquivo
      const fileRef = ref(storage!, `cvs/${user.uid}/${file.name}`)
      await uploadBytes(fileRef, file)
      const downloadUrl = await getDownloadURL(fileRef)

      // Atualiza path no perfil
      await updateProfile({ resumePath: downloadUrl } as any)

      // TODO: chamar Cloud Function para parsing real do CV
      // Por enquanto retorna array vazio (user adicionará skills manualmente)
      return []
    },
    [user, updateProfile],
  )

  return { profile, loading, error, updateProfile, updateSkills, uploadResume }
}
