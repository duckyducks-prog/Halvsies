import { useEffect, useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
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
import { fetchInsight } from '@/lib/cloud'
import { partnerOf } from '@/lib/identity'
import { color, photoTextShadow, radius } from '@/theme/tokens'
import { weekCounts, isSameDay } from '@/lib/stats'

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
  const total = week.Meg + week.Leti
  const megPct = total ? Math.round((week.Meg / total) * 100) : 50
  const letiPct = 100 - megPct
  const streak = useMemo(() => sharedStreak(completions.map((c) => c.at)), [completions])
  const doneToday = completions.filter((c) => isSameDay(c.at)).length

  const partner = partnerOf(currentMember)
  const lead = megPct === letiPct ? null : megPct > letiPct ? 'Meg' : 'Leti'
  // The person who's carried less this week is who a re-balancing task goes to.
  const behind = lead === null ? partner : lead === 'Meg' ? 'Leti' : 'Meg'

  const fallbackMessage =
    lead === null
      ? "You're perfectly in sync this week — a true 50/50. 💛"
      : `${lead} has carried a bit more this week. A small nudge or swapping a task keeps things even.`

  // Real Claude check-in (cached weekly by the Edge Function); falls back to the
  // computed sentence in local mode or before the first run.
  const [insight, setInsight] = useState<string | null>(null)
  useEffect(() => {
    if (!cloud) return
    let active = true
    fetchInsight()
      .then((t) => { if (active) setInsight(t) })
      .catch(() => {})
    return () => { active = false }
  }, [cloud])

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
            <Txt variant="eyebrow" color={color.leti} style={{ marginBottom: 8 }}>
              ✦ Halvsies check-in
            </Txt>
            <Txt variant="bodyMed" style={{ lineHeight: 21 }}>
              {checkin}
            </Txt>
            {lead && (
              <View style={styles.chipRow}>
                <Pressable
                  style={styles.inkChip}
                  onPress={() => router.push({ pathname: '/new-task', params: { owner: behind } })}>
                  <Txt variant="label" color={color.white}>
                    Give {behind} a task
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
            )}
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
