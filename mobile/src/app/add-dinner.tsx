import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { color, radius } from '@/theme/tokens'
import type { MemberName } from '@/types'

export default function AddDinner() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { date } = useLocalSearchParams<{ date: string }>()
  const { recipes, addMeal, currentMember } = useData()

  const [recipeId, setRecipeId] = useState<string | null>(null)
  const [cook, setCook] = useState<MemberName>(currentMember)
  const [push, setPush] = useState(true)

  const dayLabel = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long' })
    : 'day'

  const save = () => {
    if (!recipeId || !date) return
    addMeal({ date: String(date), recipeId, cook, pushToGrocery: push })
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
        <Txt variant="h2">Add dinner · {dayLabel}</Txt>
        <Pressable onPress={recipeId ? save : undefined} hitSlop={10} disabled={!recipeId}>
          <Txt variant="label" color={recipeId ? color.ink : color.faint}>
            Add
          </Txt>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 130, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Txt variant="eyebrow">Choose a recipe</Txt>
          {recipes.map((r) => {
            const selected = recipeId === r.id
            return (
              <Pressable key={r.id} onPress={() => setRecipeId(r.id)}>
                <Card style={[styles.recipe, selected && styles.recipeSel]}>
                  <View style={{ flex: 1 }}>
                    <Txt variant="bodyMed">{r.name}</Txt>
                    <Txt variant="meta">
                      {r.ingredients.length
                        ? `${r.ingredients.length} ingredients`
                        : 'No ingredients yet'}
                    </Txt>
                  </View>
                  {selected && <Icon name="check" size={18} color={color.meg} />}
                </Card>
              </Pressable>
            )
          })}
          <Pressable style={styles.addNew} onPress={() => router.push('/recipe')}>
            <Icon name="plus" size={16} color={color.muted} />
            <Txt variant="label" color={color.muted}>
              Add a new recipe
            </Txt>
          </Pressable>
        </View>

        <View style={{ gap: 8 }}>
          <Txt variant="eyebrow">Who's cooking</Txt>
          <View style={styles.segment}>
            {(['Meg', 'Leti'] as MemberName[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => setCook(m)}
                style={[styles.segItem, cook === m && styles.segItemActive]}>
                <Avatar owner={m} size={18} />
                <Txt variant="label" color={cook === m ? color.ink : color.muted}>
                  {m}
                </Txt>
              </Pressable>
            ))}
          </View>
        </View>

        <Card>
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Txt variant="bodyMed">Add ingredients to grocery</Txt>
              <Txt variant="meta">Only recipes with ingredients add anything.</Txt>
            </View>
            <Switch
              value={push}
              onValueChange={setPush}
              trackColor={{ true: color.leti, false: color.hairline }}
              thumbColor={color.surface}
            />
          </View>
        </Card>

        <Pressable style={[styles.primary, !recipeId && { opacity: 0.4 }]} onPress={recipeId ? save : undefined} disabled={!recipeId}>
          <Txt variant="label" color={color.white}>
            Add to {dayLabel}
          </Txt>
        </Pressable>
      </ScrollView>
      <TabBar />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.hairline },
  headerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  recipe: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderColor: 'transparent' },
  recipeSel: { borderColor: color.meg },
  addNew: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 14, borderRadius: radius.card, borderWidth: 1.5,
    borderColor: color.hairline, borderStyle: 'dashed',
  },
  segment: { flexDirection: 'row', backgroundColor: color.surfaceAlt, borderRadius: 20, padding: 3 },
  segItem: {
    flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 9, alignItems: 'center',
    justifyContent: 'center', borderRadius: 18,
  },
  segItemActive: { backgroundColor: color.surface },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  primary: {
    backgroundColor: color.ink, paddingVertical: 16, borderRadius: radius.button, alignItems: 'center',
  },
})
