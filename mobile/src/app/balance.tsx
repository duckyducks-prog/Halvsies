import { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { BalanceBar } from '@/components/BalanceBar'
import { PhotoHeader } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { fetchInsight, refreshInsight } from '@/lib/cloud'
import { partnerOf } from '@/lib/identity'
import { color, photoTextShadow, radius } from '@/theme/tokens'
import {
  weekCounts,
  countsForWeek,
  weekSplit,
  balanceTrend,
  weekStartKey,
  startOfWeek,
  isSameDay,
} from '@/lib/stats'

function sharedStreak(ats: string[]): number {
  if (ats.length === 0) return 0
  const days = new Set(ats.map((a) => new Date(a).toDateString()))
  let streak = 0
  const cur = new Date()
  // allow today to be empty without breaking the streak
  if (!days.has(cur.toDateString())) cur.setDate(cur.getDate() - 1)
  while (days.has(cur.toDateString())) {
    streak++
    cur.setDate(cur.getDate() - 1)
  }
  return streak
}

export default function BalanceScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { completions, currentMember, cloud } = useData()

  const week = useMemo(() => weekCounts(completions), [completions])
  const { total, megPct, letiPct } = weekSplit(week)
  const streak = useMemo(() => sharedStreak(completions.map((c) => c.at)), [completions])
  const doneToday = completions.filter((c) => isSameDay(c.at)).length

  // Last week's split, for the week-over-week comparison line.
  const lastWeek = useMemo(() => {
    const lastMonday = startOfWeek(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    return weekSplit(countsForWeek(completions, lastMonday))
  }, [completions])
  const trend = lastWeek.total ? balanceTrend(megPct, lastWeek.megPct) : null

  const partner = partnerOf(currentMember)
  const lead = megPct === letiPct ? null : megPct > letiPct ? 'Meg' : 'Leti'
  const iDidMore = lead !== null && currentMember === lead

  // The re-balancing offer adapts to who's viewing: if you carried less, the move
  // is to pick up a task; if you carried more, hand your partner one (or nudge them).
  const fallbackMessage =
    lead === null
      ? "You're perfectly in sync this week — a true 50/50. 💛"
      : iDidMore
        ? `You've carried a bit more this week — handing ${partner} a task or a gentle nudge keeps things even.`
        : `${partner} has carried a bit more this week — picking up a task keeps you both balanced. 💛`

  // Real Claude check-in (cached weekly by the Edge Function); falls back to the
  // computed sentence in local mode or before the first run. Cloud users can also
  // trigger a fresh one on demand via the refresh control.
  const weekKey = weekStartKey()
  const [insight, setInsight] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshError, setRefreshError] = useState(false)
  useEffect(() => {
    if (!cloud) return
    let active = true
    fetchInsight(weekKey)
      .then((t) => { if (active) setInsight(t) })
      .catch(() => {})
    return () => { active = false }
  }, [cloud, weekKey])

  const onRefresh = async () => {
    setRefreshing(true)
    setRefreshError(false)
    try {
      const t = await refreshInsight(weekKey)
      if (t) setInsight(t)
    } catch {
      setRefreshError(true)
    } finally {
      setRefreshing(false)
    }
  }

  const checkin = insight ?? fallbackMessage

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PhotoHeader source={photos.balance}>
          <Txt variant="display" color={color.white} style={photoTextShadow}>
            Balance
          </Txt>
          <Txt variant="bodyMed" color="rgba(255,255,255,0.92)" style={[{ marginTop: 4 }, photoTextShadow]}>
            How the week is splitting
          </Txt>
        </PhotoHeader>

        <View style={styles.body}>
          {/* Check-in card */}
          <Card style={styles.checkin}>
            <View style={styles.eyebrowRow}>
              <Txt variant="eyebrow" color={color.leti}>
                ✦ Halvsies check-in
              </Txt>
              {cloud && (
                <Pressable onPress={onRefresh} disabled={refreshing} hitSlop={10}>
                  {refreshing ? (
                    <ActivityIndicator size="small" color={color.leti} />
                  ) : (
                    <Icon name="repeat" size={16} color={color.muted} />
                  )}
                </Pressable>
              )}
            </View>
            <Txt variant="bodyMed" style={{ lineHeight: 21 }}>
              {checkin}
            </Txt>
            {refreshError && (
              <Txt variant="meta" color={color.rust} style={{ marginTop: 6 }}>
                Couldn't reach the check-in service — try again.
              </Txt>
            )}
            {lead &&
              (iDidMore ? (
                <View style={styles.chipRow}>
                  <Pressable
                    style={styles.inkChip}
                    onPress={() => router.push({ pathname: '/new-task', params: { owner: partner } })}>
                    <Txt variant="label" color={color.white}>
                      Give {partner} a task
                    </Txt>
                  </Pressable>
                  <Pressable
                    style={styles.outlineChip}
                    onPress={() => router.push({ pathname: '/nudge', params: { to: partner } })}>
                    <Txt variant="label" color={color.ink}>
                      Nudge {partner}
                    </Txt>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.chipRow}>
                  <Pressable
                    style={styles.inkChip}
                    onPress={() => router.push({ pathname: '/pick-up', params: { owner: partner } })}>
                    <Txt variant="label" color={color.white}>
                      Pick up a task
                    </Txt>
                  </Pressable>
                </View>
              ))}
          </Card>

          {/* Split card */}
          <Card style={{ gap: 12 }}>
            <View style={styles.splitHead}>
              <Txt variant="h2">This week</Txt>
              <Txt variant="meta">
                {megPct}% · {letiPct}%
              </Txt>
            </View>
            <BalanceBar meg={week.Meg} leti={week.Leti} height={12} />
            <View style={styles.legendRow}>
              <Legend c={color.meg} name="Meg" n={week.Meg} />
              <Legend c={color.leti} name="Leti" n={week.Leti} />
            </View>
            {trend && (
              <Txt variant="meta" color={color.muted}>
                Last week: {lastWeek.megPct}% · {lastWeek.letiPct}%
                {trend === 'more even' ? ' · more even ↑' : trend === 'less even' ? ' · less even ↓' : ' · same balance'}
              </Txt>
            )}
          </Card>

          {/* Tiles */}
          <View style={styles.tiles}>
            <Card style={styles.tile}>
              <Txt variant="display">{doneToday}</Txt>
              <Txt variant="meta">done today</Txt>
            </Card>
            <Card style={styles.tile}>
              <Txt variant="display">{streak}</Txt>
              <Txt variant="meta">day shared streak</Txt>
            </Card>
          </View>
        </View>
      </ScrollView>

      {/* Back control floats over the photo header */}
      <Pressable onPress={() => router.back()} style={[styles.back, { top: insets.top + 6 }]} hitSlop={10}>
        <Icon name="chevronLeft" size={22} color={color.white} />
        <Txt variant="label" color={color.white} style={photoTextShadow}>
          Today
        </Txt>
      </Pressable>
      <TabBar />
    </View>
  )
}

function Legend({ c, name, n }: { c: string; name: string; n: number }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Txt variant="meta">
        {name} · {n} done
      </Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  back: { position: 'absolute', left: 20, flexDirection: 'row', alignItems: 'center', gap: 2 },
  body: { paddingHorizontal: 24, paddingTop: 16, gap: 14 },
  checkin: { backgroundColor: '#EFF2EF', borderWidth: 1, borderColor: color.letiSoft },
  eyebrowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 14 },
  inkChip: { backgroundColor: color.ink, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill },
  outlineChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: color.hairline,
  },
  splitHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendRow: { flexDirection: 'row', gap: 18 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  tiles: { flexDirection: 'row', gap: 12 },
  tile: { flex: 1, gap: 2, paddingVertical: 18 },
})
