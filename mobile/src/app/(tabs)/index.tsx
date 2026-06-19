import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { FullBleedPhoto } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { ProgressRing } from '@/components/ProgressRing'
import { BalanceBar } from '@/components/BalanceBar'
import { TaskCard } from '@/components/TaskCard'
import { Card } from '@/components/Card'
import { color, photoTextShadow } from '@/theme/tokens'
import { todaysTasks, progressOf, weekCounts } from '@/lib/stats'
import { isCheckedOff } from '@/lib/frequency'

type Scope = 'Everyone' | 'Just me'

export default function TodayScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tasks, completions, currentMember, completeTask, uncompleteTask } = useData()
  const [scope, setScope] = useState<Scope>('Everyone')

  const mine = (ownerSensitive: typeof tasks) =>
    scope === 'Just me'
      ? ownerSensitive.filter((t) => t.owner === currentMember || t.owner === 'Both')
      : ownerSensitive

  const today = useMemo(
    () => mine(todaysTasks(tasks, completions)).sort((a, b) => a.sortOrder - b.sortOrder),
    [tasks, completions, scope, currentMember],
  )
  const ring = useMemo(() => progressOf(today), [today])
  const week = useMemo(() => weekCounts(completions), [completions])

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  const toggle = (t: (typeof tasks)[number]) =>
    isCheckedOff(t) ? uncompleteTask(t) : completeTask(t)

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Photo header */}
        <View style={styles.header}>
          <FullBleedPhoto source={photos.today}>
            <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, flex: 1 }}>
              <Txt style={[styles.wordmark, photoTextShadow]} color={color.white}>
                Halvsies
              </Txt>
              <View style={styles.greetRow}>
                <View style={{ flex: 1 }}>
                  <Txt
                    variant="eyebrow"
                    color="rgba(255,255,255,0.9)"
                    style={[{ marginBottom: 6 }, photoTextShadow]}>
                    {dateLabel}
                  </Txt>
                  <Txt variant="display" color={color.white} style={photoTextShadow}>
                    Hey, {currentMember}
                  </Txt>
                </View>
                <ProgressRing done={ring.done} total={ring.total} tint="light" />
              </View>
            </View>
          </FullBleedPhoto>
        </View>

        {/* Pulled-up content */}
        <View style={styles.body}>
          <View style={styles.segment}>
            {(['Everyone', 'Just me'] as Scope[]).map((s) => (
              <Pressable
                key={s}
                onPress={() => setScope(s)}
                style={[styles.segItem, scope === s && styles.segItemActive]}>
                <Txt variant="label" color={scope === s ? color.ink : color.muted}>
                  {s}
                </Txt>
              </Pressable>
            ))}
          </View>

          {/* Week balance card */}
          <Pressable onPress={() => router.push('/balance')}>
            <Card style={{ gap: 10 }}>
              <View style={styles.balanceHead}>
                <Txt variant="h2">This week</Txt>
                <Txt variant="meta">
                  {week.Meg} · {week.Leti}
                </Txt>
              </View>
              <BalanceBar meg={week.Meg} leti={week.Leti} />
              <View style={styles.balanceLegend}>
                <Legend color={color.meg} name="Meg" n={week.Meg} />
                <Legend color={color.leti} name="Leti" n={week.Leti} />
              </View>
            </Card>
          </Pressable>

          <Txt variant="eyebrow" style={{ marginTop: 6 }}>
            Today
          </Txt>
          <View style={{ gap: 9 }}>
            {today.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onPress={() => router.push(`/task/${t.id}`)}
                onToggle={() => toggle(t)}
              />
            ))}
            {today.length === 0 && (
              <Txt variant="meta" style={{ paddingVertical: 24, textAlign: 'center' }}>
                Nothing left today — nice work. 🎉
              </Txt>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function Legend({ color: c, name, n }: { color: string; name: string; n: number }) {
  return (
    <View style={styles.legend}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Txt variant="meta">
        {name} {n}
      </Txt>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  header: { height: 320 },
  wordmark: { fontFamily: 'Bricolage_700', fontSize: 15, letterSpacing: -0.3 },
  greetRow: { flexDirection: 'row', alignItems: 'flex-end', flex: 1, paddingBottom: 22, gap: 12 },
  body: { paddingHorizontal: 24, marginTop: -28, gap: 14 },
  segment: { flexDirection: 'row', backgroundColor: color.surfaceAlt, borderRadius: 20, padding: 3 },
  segItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 18 },
  segItemActive: { backgroundColor: color.surface },
  balanceHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLegend: { flexDirection: 'row', gap: 16 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
})
