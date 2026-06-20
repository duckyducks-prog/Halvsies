import { useState } from 'react'
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useData } from '@/state/DataProvider'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { color, radius, shadow } from '@/theme/tokens'
import { partnerOf } from '@/lib/identity'
import { isCheckedOff } from '@/lib/frequency'
import type { MemberName } from '@/types'

/** Pick up one of your partner's outstanding tasks and do it for them — the
 *  completion is credited to you, so it evens out the week's balance. */
export default function PickUpSheet() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tasks, completeTask, currentMember } = useData()
  const { owner } = useLocalSearchParams<{ owner?: string }>()

  const partner: MemberName = owner === 'Meg' || owner === 'Leti' ? owner : partnerOf(currentMember)

  // Their tasks that still need doing this period.
  const open = tasks
    .filter((t) => t.owner === partner && !isCheckedOff(t))
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const [takenName, setTakenName] = useState<string | null>(null)

  const take = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return
    if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    completeTask(task) // credited to the current member → rebalances the week
    setTakenName(task.name)
    setTimeout(() => setTakenName(null), 1600)
  }

  return (
    <View style={styles.root}>
      <View style={styles.grabber} />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Txt variant="label" color={color.muted}>
            Done
          </Txt>
        </Pressable>
        <Txt variant="h2">Pick up a task</Txt>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.toRow}>
        <Avatar owner={partner} size={34} />
        <View>
          <Txt variant="eyebrow">Doing it for</Txt>
          <Txt variant="h2">{partner}</Txt>
        </View>
      </View>

      {takenName && (
        <View style={styles.toast}>
          <Icon name="check" size={15} color={color.white} />
          <Txt variant="label" color={color.white}>
            Picked up “{takenName}” — thanks for helping out 💛
          </Txt>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 6, paddingBottom: insets.bottom + 120, gap: 10 }}>
        {open.length === 0 ? (
          <Card style={styles.empty}>
            <Txt variant="bodyMed" color={color.muted} style={{ textAlign: 'center' }}>
              Nothing of {partner}’s left to do right now — you’re all caught up. 💛
            </Txt>
          </Card>
        ) : (
          open.map((t) => (
            <Pressable key={t.id} style={styles.row} onPress={() => take(t.id)}>
              <View style={styles.rowBody}>
                <Txt variant="bodyMed" numberOfLines={1}>
                  {t.name}
                </Txt>
                <View style={styles.meta}>
                  <Avatar owner={t.owner} size={16} />
                  <Txt variant="meta">
                    {t.owner} · {t.frequency}
                  </Txt>
                </View>
              </View>
              <View style={styles.take}>
                <Icon name="check" size={16} color={color.white} />
                <Txt variant="label" color={color.white}>
                  I’ll do it
                </Txt>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
      <TabBar />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain, paddingTop: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.hairline },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  toRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingBottom: 14 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: color.leti,
    marginHorizontal: 24,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.card,
  },
  empty: { paddingVertical: 28 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    padding: 13,
    ...shadow.card,
  },
  rowBody: { flex: 1, gap: 5 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  take: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: color.ink,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: radius.pill,
  },
})
