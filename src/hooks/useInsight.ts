import { useEffect, useState } from 'react'
import type { Insight } from '../types'
import { supabase, isCloudEnabled } from '../lib/supabase'

interface InsightRow {
  week_start: string
  text: string
  created_at: string
}

const fromRow = (r: InsightRow): Insight => ({
  weekStart: r.week_start,
  text: r.text,
  createdAt: r.created_at,
})

/**
 * The latest cached weekly insight (cloud only). Reads the most recent row and
 * stays live via Realtime; returns null in local mode or before one is generated.
 */
export function useInsight(): { insight: Insight | null; loading: boolean } {
  const [insight, setInsight] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(isCloudEnabled)

  useEffect(() => {
    if (!isCloudEnabled || !supabase) {
      setLoading(false)
      return
    }
    let active = true

    const fetchLatest = () =>
      supabase!
        .from('insights')
        .select('*')
        .order('week_start', { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (!active) return
          const row = (data as InsightRow[] | null)?.[0]
          setInsight(row ? fromRow(row) : null)
          setLoading(false)
        })

    fetchLatest()

    const channel = supabase
      .channel('insights-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insights' }, fetchLatest)
      .subscribe()

    return () => {
      active = false
      supabase!.removeChannel(channel)
    }
  }, [])

  return { insight, loading }
}
