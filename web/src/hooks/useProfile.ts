"use client"

import { useState, useCallback } from "react"
import { MOCK_MODE } from "@/lib/firebase"
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
  const [profile, setProfile] = useState<MockUser | null>(mockUser)
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  const updateProfile = useCallback(async (data: Partial<MockUser>) => {
    setProfile((prev) => (prev ? { ...prev, ...data } : null))
  }, [])

  const updateSkills = useCallback(async (skills: string[]) => {
    setProfile((prev) => (prev ? { ...prev, skills } : null))
  }, [])

  const uploadResume = useCallback(async (file: File): Promise<string[]> => {
    // Mock: simula parsing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(["Java", "Spring Boot", "SQL", "Docker", "Git", "Angular", "TypeScript"])
      }, 2000)
    })
  }, [])

  return { profile, loading, error, updateProfile, updateSkills, uploadResume }
}
