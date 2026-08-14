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

export function useProfile(): UseProfileReturn {
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Espera auth resolver primeiro
    if (authLoading) return

    if (MOCK_MODE || !user || !db) {
      // Mock ou não logado: usa dados mock para preview
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
          setProfile(null)
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, authLoading])

  const updateProfile = useCallback(
    async (data: Partial<MockUser>) => {
      if (MOCK_MODE || !user || !db) {
        setProfile((prev) => (prev ? { ...prev, ...data } : null))
        return
      }

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
      if (MOCK_MODE || !user || !storage || !db) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(["Java", "Spring Boot", "SQL", "Docker", "Git", "Angular", "TypeScript"])
          }, 2000)
        })
      }

      const fileRef = ref(storage!, `cvs/${user.uid}/${file.name}`)
      await uploadBytes(fileRef, file)
      const downloadUrl = await getDownloadURL(fileRef)
      await updateProfile({ resumePath: downloadUrl } as any)
      return []
    },
    [user, updateProfile],
  )

  return { profile, loading, error, updateProfile, updateSkills, uploadResume }
}
