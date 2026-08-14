"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore"
import { db, MOCK_MODE } from "@/lib/firebase"
import { mockMatches, MockMatch } from "@/mocks/matches"
import { useAuth } from "./useAuth"

export interface UseMatchesReturn {
  matches: MockMatch[]
  loading: boolean
  error: string | null
}

/**
 * Hook para obter matches do usuário — Firestore realtime ou mock.
 */
export function useMatches(maxResults: number = 50): UseMatchesReturn {
  const { user } = useAuth()
  const [matches, setMatches] = useState<MockMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (MOCK_MODE) {
      // Mock: retorna matches simulados
      setMatches(mockMatches)
      setLoading(false)
      return
    }

    if (!user || !db) {
      setMatches([])
      setLoading(false)
      return
    }

    // Firestore realtime listener
    const q = query(
      collection(db, "matches"),
      where("userId", "==", user.uid),
      where("score", ">=", 0.4),
      orderBy("score", "desc"),
      limit(maxResults),
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as unknown as MockMatch[]
        setMatches(docs)
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user, maxResults])

  return { matches, loading, error }
}
