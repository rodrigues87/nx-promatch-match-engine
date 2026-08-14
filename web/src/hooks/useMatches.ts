"use client"

import { useState, useEffect } from "react"
import { mockMatches, MockMatch } from "@/mocks/matches"

export interface UseMatchesReturn {
  matches: MockMatch[]
  loading: boolean
  error: string | null
}

export function useMatches(): UseMatchesReturn {
  const [matches, setMatches] = useState<MockMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error] = useState<string | null>(null)

  useEffect(() => {
    // Mock mode: carrega dados simulados
    setMatches(mockMatches)
    setLoading(false)
  }, [])

  return { matches, loading, error }
}
