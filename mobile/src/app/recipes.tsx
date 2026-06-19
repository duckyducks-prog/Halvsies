import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { PhotoHeader } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { color, photoTextShadow, radius } from '@/theme/tokens'

export default function RecipesScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { recipes, meals } = useData()
  const inPlan = new Set(meals.map((m) => m.recipeId))

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PhotoHeader source={photos.recipes} height={210}>
          <Pressable
            onPress={() => router.back()}
            style={[styles.back, { top: insets.top + 6 }]}
            hitSlop={10}>
            <Icon name="chevronLeft" size={22} color={color.white} />
            <Txt variant="label" color={color.white}>
              Meals
            </Txt>
          </Pressable>
          <Txt variant="display" color={color.white} style={photoTextShadow}>
            Recipes
          </Txt>
        </PhotoHeader>

        <View style={styles.body}>
          <Pressable style={styles.addRecipe} onPress={() => router.push('/recipe')}>
            <Icon name="plus" size={18} color={color.muted} />
            <Txt variant="bodyMed" color={color.muted}>
              Add a recipe
            </Txt>
          </Pressable>

          {recipes.map((r) => {
            const empty = r.ingredients.length === 0
            return (
              <Pressable
                key={r.id}
                onPress={() => router.push({ pathname: '/recipe', params: { id: r.id } })}>
                <Card style={styles.recipeRow}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Txt variant="bodyMed">{r.name}</Txt>
                    {empty ? (
                      <Txt variant="meta" color="#A9762F">
                        No ingredients yet · tap to add
                      </Txt>
                    ) : (
                      <Txt variant="meta">
                        {r.ingredients.length} ingredient{r.ingredients.length === 1 ? '' : 's'}
                      </Txt>
                    )}
                  </View>
                  {inPlan.has(r.id) && (
                    <View style={styles.tag}>
                      <Txt variant="label" color={color.letiDeep} style={{ fontSize: 11 }}>
                        In plan
                      </Txt>
                    </View>
                  )}
                  <Icon name="chevron" size={18} color={color.faint} />
                </Card>
              </Pressable>
            )
          })}
        </View>
      </ScrollView>
      <TabBar />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  back: { position: 'absolute', left: 24, flexDirection: 'row', alignItems: 'center', gap: 2 },
  body: { paddingHorizontal: 24, paddingTop: 14, gap: 10 },
  addRecipe: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 16, borderRadius: radius.card, borderWidth: 1.5,
    borderColor: color.hairline, borderStyle: 'dashed',
  },
  recipeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tag: { backgroundColor: color.letiSoft, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill },
})
