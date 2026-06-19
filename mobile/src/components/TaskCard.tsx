import { Pressable, StyleSheet, View } from 'react-native'
import type { Task } from '../types'
import { color, radius, shadow } from '../theme/tokens'
import { dueLabel, isCheckedOff, isDue } from '../lib/frequency'
import { Txt } from './Txt'
import { Avatar } from './Avatar'
import { Checkbox } from './Checkbox'

interface Props {
  task: Task
  onPress: () => void
  onToggle: () => void
}

export function TaskCard({ task, onPress, onToggle }: Props) {
  const checked = isCheckedOff(task)
  const due = isDue(task) && !checked
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Checkbox checked={checked} owner={task.owner} onToggle={onToggle} />
      <View style={styles.body}>
        <Txt
          variant="bodyMed"
          numberOfLines={1}
          style={checked ? styles.struck : undefined}
          color={checked ? color.muted : color.ink}>
          {task.name}
        </Txt>
        <View style={styles.meta}>
          <Avatar owner={task.owner} size={17} />
          <Txt variant="meta">
            {task.owner} · {task.frequency}
          </Txt>
        </View>
        {task.note ? (
          <View style={styles.note}>
            <Txt variant="meta" numberOfLines={1} style={{ fontSize: 11.5 }}>
              ✎ {task.note}
            </Txt>
          </View>
        ) : null}
      </View>
      {due ? (
        <View style={styles.dueBadge}>
          <Txt style={styles.dueText}>{dueLabel(task) === 'Due now' ? 'Due' : dueLabel(task)}</Txt>
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: color.surface,
    borderRadius: radius.card,
    padding: 13,
    ...shadow.card,
  },
  body: { flex: 1, gap: 5 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  struck: { textDecorationLine: 'line-through' },
  note: { flexDirection: 'row', alignItems: 'center' },
  dueBadge: {
    backgroundColor: color.noteBg,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  dueText: { fontFamily: 'Hanken_600', fontSize: 11, color: color.rust },
})
