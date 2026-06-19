import { ScrollView, StyleSheet, View, Pressable } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { color, font, radius, personColors } from '@/theme/tokens'
import { dueLabel, nextDue } from '@/lib/frequency'

function relative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.round(diff / 3600_000)
  if (h < 1) return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.round(h / 24)
  return d === 1 ? 'yesterday' : `${d}d ago`
}

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { taskById, completions, deleteTask } = useData()
  const task = taskById(String(id))

  if (!task) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + 40, paddingHorizontal: 24 }]}>
        <Txt variant="body">This task no longer exists.</Txt>
      </View>
    )
  }

  const history = completions
    .filter((c) => c.taskId === task.id)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5)
  const due = nextDue(task)
  const ownerChipColors =
    task.owner === 'Both' ? { soft: color.surfaceAlt, deep: color.ink } : personColors(task.owner)

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.header, { paddingTop: insets.top + 6 }]}>
          <Pressable onPress={() => router.back()} style={styles.back} hitSlop={10}>
            <View style={{ transform: [{ rotate: '180deg' }] }}>
              <Icon name="chevron" size={22} />
            </View>
            <Txt variant="label">Tasks</Txt>
          </Pressable>

          <Txt variant="title" style={{ marginTop: 12 }}>
            {task.name}
          </Txt>
          <View style={[styles.ownerChip, { backgroundColor: ownerChipColors.soft }]}>
            <Avatar owner={task.owner} size={18} />
            <Txt variant="label" color={ownerChipColors.deep}>
              {task.owner}
            </Txt>
          </View>
        </View>

        <View style={styles.body}>
          <Card style={{ gap: 0, paddingVertical: 4 }}>
            <Row label="Repeats" value={task.frequency} />
            <Divider />
            <Row label="Next due" value={due ? dueLabel(task) : '—'} />
            <Divider />
            <Row
              label="Reminder"
              value={task.reminderEnabled ? 'On' : 'Off'}
              valueColor={task.reminderEnabled ? color.leti : color.muted}
            />
          </Card>

          {task.note ? (
            <View style={styles.note}>
              <Txt variant="eyebrow" style={{ marginBottom: 6 }}>
                Note
              </Txt>
              <Txt variant="body">{task.note}</Txt>
            </View>
          ) : null}

          {history.length > 0 && (
            <View style={{ gap: 9 }}>
              <Txt variant="eyebrow">Recent</Txt>
              {history.map((c) => (
                <View key={c.id} style={styles.historyRow}>
                  <Avatar owner={c.member} size={20} />
                  <Txt variant="body" style={{ flex: 1 }}>
                    {c.member}
                  </Txt>
                  <Txt variant="meta">{relative(c.at)}</Txt>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer}>
            <Pressable
              style={styles.primary}
              onPress={() => router.push({ pathname: '/new-task', params: { id: task.id } })}>
              <Txt variant="label" color={color.white}>
                Edit task
              </Txt>
            </Pressable>
            <Pressable
              style={styles.delete}
              onPress={() => {
                deleteTask(task.id)
                router.back()
              }}>
              <Txt variant="label" color={color.rust}>
                Delete
              </Txt>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.row}>
      <Txt variant="body" color={color.muted}>
        {label}
      </Txt>
      <Txt variant="bodyMed" color={valueColor ?? color.ink}>
        {value}
      </Txt>
    </View>
  )
}

const Divider = () => <View style={styles.divider} />

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  header: { paddingHorizontal: 24, paddingBottom: 6 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: -4 },
  ownerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: 12,
  },
  body: { paddingHorizontal: 24, paddingTop: 16, gap: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: color.hairline, marginHorizontal: 10 },
  note: {
    backgroundColor: color.noteBg,
    borderWidth: 1,
    borderColor: color.noteBorder,
    borderRadius: radius.card,
    padding: 14,
  },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  primary: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: color.ink,
    paddingVertical: 15,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delete: { paddingVertical: 15, paddingHorizontal: 18, borderRadius: radius.button },
})
