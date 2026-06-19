import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useData } from '@/state/DataProvider'
import { PhotoHeader } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { Chip } from '@/components/Chip'
import { TaskCard } from '@/components/TaskCard'
import { color, photoTextShadow } from '@/theme/tokens'
import { isCheckedOff } from '@/lib/frequency'
import type { Owner } from '@/types'

type Filter = 'All' | 'Meg' | 'Leti'
const FILTERS: Filter[] = ['All', 'Meg', 'Leti']

export default function TasksScreen() {
  const router = useRouter()
  const { tasks, areas, completeTask, uncompleteTask } = useData()
  const [filter, setFilter] = useState<Filter>('All')

  const visible = useMemo(() => {
    const matches = (o: Owner) => filter === 'All' || o === filter || o === 'Both'
    return tasks.filter((t) => matches(t.owner))
  }, [tasks, filter])

  const toggle = (id: string) => {
    const t = tasks.find((x) => x.id === id)!
    isCheckedOff(t) ? uncompleteTask(t) : completeTask(t)
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PhotoHeader source={photos.tasks}>
          <Txt variant="display" color={color.white} style={photoTextShadow}>
            All tasks
          </Txt>
        </PhotoHeader>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Chip key={f} label={f} selected={filter === f} onPress={() => setFilter(f)} />
          ))}
        </View>

        <View style={styles.body}>
          {areas.map((area) => {
            const rows = visible
              .filter((t) => t.areaId === area.id)
              .sort((a, b) => a.sortOrder - b.sortOrder)
            if (rows.length === 0) return null
            return (
              <View key={area.id} style={{ gap: 9 }}>
                <Txt variant="eyebrow">{area.name}</Txt>
                {rows.map((t) => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onPress={() => router.push(`/task/${t.id}`)}
                    onToggle={() => toggle(t.id)}
                  />
                ))}
              </View>
            )
          })}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  filters: { flexDirection: 'row', gap: 8, paddingHorizontal: 24, marginTop: -8, marginBottom: 8 },
  body: { paddingHorizontal: 24, gap: 22, paddingTop: 8 },
})
