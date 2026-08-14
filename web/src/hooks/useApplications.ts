"use client"

import { useState, useEffect, useCallback } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore"
import { db, MOCK_MODE } from "@/lib/firebase"
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

/**
 * Hook para candidaturas — Firestore realtime ou mock.
 */
export function useApplications(): UseApplicationsReturn {
  const { user } = useAuth()
  const [applications, setApplications] = useState<MockApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (MOCK_MODE) {
      setApplications(mockApplications)
      setLoading(false)
      return
    }

    if (!user || !db) {
      setApplications([])
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
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user])

  const requestApplication = useCallback(
    async (data: RequestApplicationData) => {
      if (MOCK_MODE) {
        // Mock: simula adição na lista
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
        return
      }

      if (!user || !db) return

      await addDoc(collection(db, "queue"), {
        userId: user.uid,
        jobId: data.jobId,
        jobTitle: data.jobTitle,
        jobCompany: data.jobCompany,
        platform: data.platform,
        status: "pending",
        matchScore: data.matchScore,
        jobUrl: data.jobUrl,
        createdAt: serverTimestamp(),
        startedAt: null,
        completedAt: null,
        attempts: 0,
        maxAttempts: 3,
        result: null,
        lastError: null,
      })
    },
    [user, applications],
  )

  const cancelApplication = useCallback(
    async (applicationId: string) => {
      if (MOCK_MODE) {
        setApplications((prev) =>
          prev.map((a) => (a.id === applicationId ? { ...a, status: "cancelled" as const } : a)),
        )
        return
      }

      if (!db) return
      const docRef = doc(db, "queue", applicationId)
      await updateDoc(docRef, { status: "cancelled" })
    },
    [],
  )

  return { applications, loading, error, requestApplication, cancelApplication }
}
