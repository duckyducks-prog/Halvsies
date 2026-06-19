import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { Txt } from '@/components/Txt'
import { Icon } from '@/components/Icon'
import { color, font, radius } from '@/theme/tokens'
import { getCurrentMember } from '@/lib/identity'
import type { Ingredient, Recipe } from '@/types'

export default function RecipeEditor() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { id } = useLocalSearchParams<{ id?: string }>()
  const { recipeById, upsertRecipe, deleteRecipe } = useData()
  const editing = id ? recipeById(String(id)) : undefined

  const [name, setName] = useState(editing?.name ?? '')
  const [rows, setRows] = useState<Ingredient[]>(
    editing?.ingredients.length ? editing.ingredients : [{ name: '', qty: '' }],
  )

  const valid = name.trim().length > 0

  const setRow = (i: number, patch: Partial<Ingredient>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setRows((rs) => [...rs, { name: '', qty: '' }])
  const removeRow = (i: number) => setRows((rs) => rs.filter((_, idx) => idx !== i))

  const save = () => {
    const ingredients = rows
      .map((r) => ({ name: r.name.trim(), qty: r.qty?.trim() || undefined }))
      .filter((r) => r.name.length > 0)
    const recipe: Recipe = {
      id: editing?.id ?? `recipe-${Date.now()}`,
      name: name.trim(),
      ingredients,
      createdBy: editing?.createdBy ?? getCurrentMember(),
    }
    upsertRecipe(recipe)
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
        <Txt variant="h2">{editing ? 'Edit recipe' : 'New recipe'}</Txt>
        <Pressable onPress={valid ? save : undefined} hitSlop={10} disabled={!valid}>
          <Txt variant="label" color={valid ? color.ink : color.faint}>
            Save
          </Txt>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 60, gap: 18 }}>
        <View style={{ gap: 8 }}>
          <Txt variant="eyebrow">Name</Txt>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="e.g. Taco night"
            placeholderTextColor={color.faint}
            style={styles.input}
            autoFocus={!editing}
          />
        </View>

        <View style={{ gap: 8 }}>
          <Txt variant="eyebrow">Ingredients</Txt>
          {rows.map((r, i) => (
            <View key={i} style={styles.ingRow}>
              <TextInput
                value={r.name}
                onChangeText={(t) => setRow(i, { name: t })}
                placeholder="Ingredient"
                placeholderTextColor={color.faint}
                style={[styles.input, { flex: 1 }]}
              />
              <TextInput
                value={r.qty}
                onChangeText={(t) => setRow(i, { qty: t })}
                placeholder="Qty"
                placeholderTextColor={color.faint}
                style={[styles.input, { width: 72 }]}
              />
              <Pressable hitSlop={8} onPress={() => removeRow(i)}>
                <Icon name="trash" size={18} color={color.faint} />
              </Pressable>
            </View>
          ))}
          <Pressable style={styles.addIng} onPress={addRow}>
            <Icon name="plus" size={16} color={color.muted} />
            <Txt variant="label" color={color.muted}>
              Add ingredient
            </Txt>
          </Pressable>
        </View>

        {editing && (
          <Pressable
            onPress={() => {
              deleteRecipe(editing.id)
              router.back()
            }}
            style={{ paddingVertical: 8 }}>
            <Txt variant="label" color={color.rust}>
              Delete recipe
            </Txt>
          </Pressable>
        )}
      </ScrollView>
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
  input: {
    backgroundColor: color.surface, borderRadius: radius.button, paddingHorizontal: 14,
    paddingVertical: 12, fontFamily: font.regular, fontSize: 15, color: color.ink,
  },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addIng: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 },
})
