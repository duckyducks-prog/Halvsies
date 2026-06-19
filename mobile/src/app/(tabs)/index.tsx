import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { FullBleedPhoto } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { BalanceBar } from '@/components/BalanceBar'
import { TaskCard } from '@/components/TaskCard'
import { Card } from '@/components/Card'
import { Avatar } from '@/components/Avatar'
import { color, photoTextShadow } from '@/theme/tokens'
import { todaysTasks, progressOf, weekCounts } from '@/lib/stats'
import { isCheckedOff } from '@/lib/frequency'
import { partnerOf } from '@/lib/identity'
import type { Task } from '@/types'

export default function TodayScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tasks, completions, currentMember, setMember, completeTask, uncompleteTask } = useData()

  const today = useMemo(
    () => todaysTasks(tasks, completions).sort((a, b) => a.sortOrder - b.sortOrder),
    [tasks, completions],
  )
  const ring = useMemo(() => progressOf(today), [today])
  const week = useMemo(() => weekCounts(completions), [completions])
  const weekTotal = week.Meg + week.Leti
  const megPct = weekTotal ? (week.Meg / weekTotal) * 100 : 50
  const balanced = Math.abs(megPct - 50) <= 18
  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const toggle = (t: Task) => (isCheckedOff(t) ? uncompleteTask(t) : completeTask(t))

  return (
    <View style={styles.root}>
      <FullBleedPhoto source={photos.today} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}>
        {/* Header over the photo */}
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24 }}>
          <View style={styles.topRow}>
            <Txt style={[styles.wordmark, photoTextShadow]} color={color.white}>
              Halvsies
            </Txt>
            <Pressable onPress={() => setMember(partnerOf(currentMember))} style={styles.mePill}>
              <Avatar owner={currentMember} size={18} />
              <Txt variant="label" color={color.white}>
                {currentMember}
              </Txt>
            </Pressable>
          </View>

          <View style={{ marginTop: 22 }}>
            <Txt variant="eyebrow" color="rgba(255,255,255,0.9)" style={[{ marginBottom: 6 }, photoTextShadow]}>
              {dateLabel}
            </Txt>
            <Txt variant="display" color={color.white} style={photoTextShadow}>
              Hey, {currentMember}
            </Txt>
            <Txt variant="bodyMed" color="rgba(255,255,255,0.95)" style={[{ marginTop: 4 }, photoTextShadow]}>
              {ring.done} of {ring.total} chore{ring.total === 1 ? '' : 's'} done today.
            </Txt>
          </View>
        </View>

        {/* Floating cards over the photo */}
        <View style={styles.body}>
          <Pressable onPress={() => router.push('/balance')}>
            <Card style={{ gap: 10 }}>
              <View style={styles.balanceHead}>
                <Txt variant="eyebrow">This week · {balanced ? 'Balanced' : 'Uneven'}</Txt>
                <Txt variant="meta">{weekTotal} done</Txt>
              </View>
              <BalanceBar meg={week.Meg} leti={week.Leti} height={12} />
              <View style={styles.legendRow}>
                <Txt variant="label" color={color.megDeep}>
                  Meg · {week.Meg}
                </Txt>
                <Txt variant="label" color={color.letiDeep}>
                  Leti · {week.Leti}
                </Txt>
              </View>
            </Card>
          </Pressable>

          {today.map((t) => (
            <TaskCard
              key={t.id}
              task={t}
              onPress={() => router.push(`/task/${t.id}`)}
              onToggle={() => toggle(t)}
            />
          ))}
          {today.length === 0 && (
            <Card style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Txt variant="bodyMed">All done for today 🎉</Txt>
              <Txt variant="meta" style={{ marginTop: 2 }}>
                Nothing left on your list.
              </Txt>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { fontFamily: 'Bricolage_700', fontSize: 15, letterSpacing: -0.3 },
  mePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  body: { paddingHorizontal: 24, marginTop: 26, gap: 11 },
  balanceHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between' },
})
