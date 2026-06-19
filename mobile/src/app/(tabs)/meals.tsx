import { ScrollView, StyleSheet, View } from 'react-native'
import { PhotoHeader } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { color } from '@/theme/tokens'

export default function MealsScreen() {
  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PhotoHeader source={photos.meals}>
          <Txt variant="display" color={color.white}>
            This week
          </Txt>
        </PhotoHeader>
        <View style={styles.body}>
          <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 36 }}>
            <Txt variant="h2">Meal planning coming soon</Txt>
            <Txt variant="meta" style={{ textAlign: 'center' }}>
              Plan dinners for the week and push ingredients straight to the grocery list.
            </Txt>
          </Card>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  body: { paddingHorizontal: 24, paddingTop: 12 },
})
