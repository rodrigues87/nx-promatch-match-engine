"use client"

import { useState, useEffect, useCallback } from "react"
import { mockUser, MockUser } from "@/mocks/users"

export interface UseProfileReturn {
  profile: MockUser | null
  loading: boolean
  error: string | null
  updateProfile: (data: Partial<MockUser>) => Promise<void>
  updateSkills: (skills: string[]) => Promise<void>
  uploadResume: (file: File) => Promise<string[]>
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    // Mock mode: carrega dados simulados
    setProfile(mockUser)
    setLoading(false)
  }, [])

  const updateProfile = useCallback(async (data: Partial<MockUser>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : null))
  }, [])

  const updateSkills = useCallback(async (skills: string[]) => {
    setProfile((prev) => (prev ? { ...prev, skills } : null))
  }, [])

  const uploadResume = useCallback(async (): Promise<string[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(["Java", "Spring Boot", "SQL", "Docker", "Git", "Angular", "TypeScript"])
      }, 2000)
    })
  }, [])

  return { profile, loading, error, updateProfile, updateSkills, uploadResume }
}
