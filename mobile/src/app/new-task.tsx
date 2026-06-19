import { useState, type ReactNode } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { Avatar } from '@/components/Avatar'
import { TabBar } from '@/components/TabBar'
import { color, font, radius } from '@/theme/tokens'
import type { Frequency, Owner, Task } from '@/types'

const OWNERS: Owner[] = ['Meg', 'Leti', 'Both']
const REPEATS: Frequency[] = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'As needed']

export default function NewTask() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { taskById, areas, upsertTask } = useData()
  const editing = id ? taskById(String(id)) : undefined

  const [name, setName] = useState(editing?.name ?? '')
  const [owner, setOwner] = useState<Owner>(editing?.owner ?? 'Meg')
  const [frequency, setFrequency] = useState<Frequency>(editing?.frequency ?? 'Weekly')
  const [note, setNote] = useState(editing?.note ?? '')
  const [reminder, setReminder] = useState(editing?.reminderEnabled ?? false)

  const valid = name.trim().length > 0

  const save = () => {
    const base: Task = editing ?? {
      id: `task-${Date.now()}`,
      areaId: areas[0].id,
      name: '',
      frequency: 'Weekly',
      owner: 'Meg',
      lastDoneAt: null,
      note: null,
      reminderEnabled: false,
      reminderTime: null,
      sortOrder: Date.now(),
    }
    upsertTask({
      ...base,
      name: name.trim(),
      owner,
      frequency,
      note: note.trim() ? note.trim() : null,
      reminderEnabled: reminder,
    })
    router.back()
  }

  return (
    <View style={[styles.root, { paddingTop: 10 }]}>
      <View style={styles.grabber} />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Txt variant="label" color={color.muted}>
            Cancel
          </Txt>
        </Pressable>
        <Txt variant="h2">{editing ? 'Edit task' : 'New task'}</Txt>
        <Pressable onPress={valid ? save : undefined} hitSlop={10} disabled={!valid}>
          <Txt variant="label" color={valid ? color.ink : color.faint}>
            Save
          </Txt>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 130, gap: 18 }}>
        <Field label="Task">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Water the plants"
            placeholderTextColor={color.faint}
            style={styles.input}
            autoFocus={!editing}
          />
        </Field>

        <Field label="Assign to">
          <View style={styles.segment}>
            {OWNERS.map((o) => (
              <Pressable
                key={o}
                onPress={() => setOwner(o)}
                style={[styles.segItem, owner === o && styles.segItemActive]}>
                <Avatar owner={o} size={18} />
                <Txt variant="label" color={owner === o ? color.ink : color.muted}>
                  {o}
                </Txt>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Repeat">
          <View style={styles.chips}>
            {REPEATS.map((f) => (
              <Pressable
                key={f}
                onPress={() => setFrequency(f)}
                style={[styles.repeatChip, frequency === f && styles.repeatChipActive]}>
                <Txt variant="label" color={frequency === f ? color.white : color.muted}>
                  {f}
                </Txt>
              </Pressable>
            ))}
          </View>
        </Field>

        <Field label="Note">
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Optional details…"
            placeholderTextColor={color.faint}
            style={[styles.input, { minHeight: 64, textAlignVertical: 'top' }]}
            multiline
          />
        </Field>

        <Card>
          <View style={styles.reminderRow}>
            <Txt variant="bodyMed">Reminder when due</Txt>
            <Switch
              value={reminder}
              onValueChange={setReminder}
              trackColor={{ true: color.leti, false: color.hairline }}
              thumbColor={color.surface}
            />
          </View>
        </Card>

        <Pressable
          style={[styles.add, !valid && { opacity: 0.4 }]}
          onPress={valid ? save : undefined}
          disabled={!valid}>
          <Txt variant="label" color={color.white}>
            {editing ? 'Save changes' : 'Add task'}
          </Txt>
        </Pressable>
      </ScrollView>
      <TabBar />
    </View>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Txt variant="eyebrow">{label}</Txt>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.hairline },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  input: {
    backgroundColor: color.surface,
    borderRadius: radius.button,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: font.regular,
    fontSize: 15,
    color: color.ink,
  },
  segment: { flexDirection: 'row', backgroundColor: color.surfaceAlt, borderRadius: 20, padding: 3 },
  segItem: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  segItemActive: { backgroundColor: color.surface },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  repeatChip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.hairline,
  },
  repeatChipActive: { backgroundColor: color.ink, borderColor: color.ink },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  add: {
    backgroundColor: color.ink,
    paddingVertical: 16,
    borderRadius: radius.button,
    alignItems: 'center',
  },
})
