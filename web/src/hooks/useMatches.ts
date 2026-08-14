"use client"

import { useState, useEffect } from "react"
import { MOCK_MODE } from "@/lib/firebase"
import { mockMatches, MockMatch } from "@/mocks/matches"
import { useAuth } from "./useAuth"

export interface UseMatchesReturn {
  matches: MockMatch[]
  loading: boolean
  error: string | null
}

export function useMatches(maxResults: number = 50): UseMatchesReturn {
  const { user, loading: authLoading } = useAuth()
  const [matches, setMatches] = useState<MockMatch[]>(MOCK_MODE ? mockMatches : [])
  const [loading, setLoading] = useState(!MOCK_MODE)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (MOCK_MODE) return

    if (authLoading) return

    if (!user) {
      setMatches(mockMatches)
      setLoading(false)
      return
    }

    // Firestore realtime
    import("firebase/firestore").then(({ collection, query, where, orderBy, limit, onSnapshot }) => {
      import("@/lib/firebase").then(({ db }) => {
        if (!db) {
          setMatches(mockMatches)
          setLoading(false)
          return
        }

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
            setMatches(mockMatches)
            setLoading(false)
          },
        )

        return () => unsubscribe()
      })
    })
  }, [user, authLoading, maxResults])

  return { matches, loading, error }
}
