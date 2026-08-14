"use client"

import { useState, useEffect, useCallback } from "react"
import { MOCK_MODE } from "@/lib/firebase"
import { mockApplications, MockApplication } from "@/mocks/applications"
import { useAuth } from "./useAuth"

export interface UseApplicationsReturn {
  applications: MockApplication[]
  loading: boolean
  error: string | null
  requestApplication: (jobData: RequestApplicationData) => Promise<void>
  cancelApplication: (applicationId: string) => Promise<void>
}

interface RequestApplicationData {
  jobId: string
  jobTitle: string
  jobCompany: string
  platform: string
  matchScore: number
  jobUrl: string
}

export function useApplications(): UseApplicationsReturn {
  const { user, loading: authLoading } = useAuth()
  const [applications, setApplications] = useState<MockApplication[]>(MOCK_MODE ? mockApplications : [])
  const [loading, setLoading] = useState(!MOCK_MODE)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (MOCK_MODE) return

    if (authLoading) return

    if (!user) {
      setApplications(mockApplications)
      setLoading(false)
      return
    }

    import("firebase/firestore").then(({ collection, query, where, orderBy, onSnapshot }) => {
      import("@/lib/firebase").then(({ db }) => {
        if (!db) {
          setApplications(mockApplications)
          setLoading(false)
          return
        }

        const q = query(
          collection(db, "queue"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        )

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const docs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as unknown as MockApplication[]
            setApplications(docs)
            setLoading(false)
          },
          (err) => {
            setError(err.message)
            setApplications(mockApplications)
            setLoading(false)
          },
        )

        return () => unsubscribe()
      })
    })
  }, [user, authLoading])

  const requestApplication = useCallback(
    async (data: RequestApplicationData) => {
      const newApp: MockApplication = {
        id: `app_mock_${Date.now()}`,
        userId: user?.uid || "mock",
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        jobCompany: data.jobCompany,
        platform: data.platform,
        status: "pending",
        matchScore: data.matchScore,
        createdAt: new Date().toISOString(),
        startedAt: null,
        completedAt: null,
        attempts: 0,
        maxAttempts: 3,
        result: null,
        lastError: null,
        queuePosition: applications.filter((a) => a.status === "pending").length + 1,
      }
      setApplications((prev) => [newApp, ...prev])
    },
    [user, applications],
  )

  const cancelApplication = useCallback(
    async (applicationId: string) => {
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: "cancelled" as const } : a)),
      )
    },
    [],
  )

  return { applications, loading, error, requestApplication, cancelApplication }
}
