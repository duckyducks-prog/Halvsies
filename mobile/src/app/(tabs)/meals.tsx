import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { FullBleedPhoto } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { GlassCard } from '@/components/GlassCard'
import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { color, photoTextShadow, radius } from '@/theme/tokens'
import { toDateKey, weekDates } from '@/lib/stats'

function weekRange(days: Date[]): string {
  const first = days[0]
  const last = days[days.length - 1]
  const m1 = first.toLocaleDateString(undefined, { month: 'long' })
  const m2 = last.toLocaleDateString(undefined, { month: 'long' })
  return first.getMonth() === last.getMonth()
    ? `${first.getDate()} – ${last.getDate()} ${m2}`
    : `${first.getDate()} ${m1} – ${last.getDate()} ${m2}`
}

export default function MealsScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { meals, recipeById } = useData()
  const days = useMemo(() => weekDates(), [])
  const todayKey = toDateKey(new Date())

  return (
    <View style={styles.root}>
      <FullBleedPhoto source={photos.meals} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24 }}>
          <View style={styles.topRow}>
            <Txt style={[styles.wordmark, photoTextShadow]} color={color.white}>
              Halvsies
            </Txt>
            <Pressable style={styles.recipesPill} onPress={() => router.push('/recipes')}>
              <Icon name="meals" size={15} color={color.white} />
              <Txt variant="label" color={color.white}>
                Recipes
              </Txt>
            </Pressable>
          </View>
          <View style={{ marginTop: 22 }}>
            <Txt variant="display" color={color.white} style={photoTextShadow}>
              This week
            </Txt>
            <Txt variant="bodyMed" color="rgba(255,255,255,0.92)" style={[{ marginTop: 4 }, photoTextShadow]}>
              Dinners · {weekRange(days)} · shared
            </Txt>
          </View>
        </View>

        <View style={styles.body}>
          <GlassCard padded={false}>
            {days.map((d, i) => {
              const key = toDateKey(d)
              const entry = meals.find((m) => m.date === key)
              const recipe = entry ? recipeById(entry.recipeId) : undefined
              const isToday = key === todayKey
              return (
                <Pressable
                  key={key}
                  style={[styles.dayRow, i > 0 && styles.rowBorder, isToday && styles.todayRow]}
                  onPress={() =>
                    entry && recipe
                      ? router.push({ pathname: '/recipe', params: { id: recipe.id } })
                      : router.push({ pathname: '/add-dinner', params: { date: key } })
                  }>
                  <View style={styles.dateCol}>
                    <Txt variant="eyebrow" color={isToday ? color.meg : color.muted}>
                      {d.toLocaleDateString(undefined, { weekday: 'short' })}
                    </Txt>
                  </View>
                  {entry && recipe ? (
                    <>
                      <Txt variant="bodyMed" style={{ flex: 1 }} numberOfLines={1}>
                        {recipe.name}
                      </Txt>
                      {entry.cook && <Avatar owner={entry.cook} size={20} />}
                    </>
                  ) : (
                    <Txt variant="body" color={color.faint} style={{ flex: 1 }}>
                      Add a dinner…
                    </Txt>
                  )}
                </Pressable>
              )
            })}
          </GlassCard>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { fontFamily: 'Bricolage_700', fontSize: 15, letterSpacing: -0.3 },
  recipesPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.18)',
  },
  body: { paddingHorizontal: 24, marginTop: 26 },
  dayRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 15 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.hairline },
  todayRow: { backgroundColor: color.megSoft },
  dateCol: { width: 44 },
})
