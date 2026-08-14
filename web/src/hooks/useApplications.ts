"use client"

import { useState, useEffect, useCallback } from "react"
import { mockApplications, MockApplication } from "@/mocks/applications"

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
  const [applications, setApplications] = useState<MockApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    // Mock mode: carrega dados simulados
    setApplications(mockApplications)
    setLoading(false)
  }, [])

  const requestApplication = useCallback(async (data: RequestApplicationData) => {
    const newApp: MockApplication = {
      id: `app_mock_${Date.now()}`,
      userId: "mock",
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
  }, [applications])

  const cancelApplication = useCallback(async (applicationId: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === applicationId ? { ...a, status: "cancelled" as const } : a)),
    )
  }, [])

  return { applications, loading, error, requestApplication, cancelApplication }
}
