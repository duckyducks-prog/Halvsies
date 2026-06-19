import { ScrollView, StyleSheet, View } from 'react-native'
import { PhotoHeader } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { color, photoTextShadow } from '@/theme/tokens'

export default function GroceryScreen() {
  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <PhotoHeader source={photos.grocery}>
          <Txt variant="display" color={color.white} style={photoTextShadow}>
            Grocery
          </Txt>
        </PhotoHeader>
        <View style={styles.body}>
          <Card style={{ alignItems: 'center', gap: 8, paddingVertical: 36 }}>
            <Txt variant="h2">Shared list coming soon</Txt>
            <Txt variant="meta" style={{ textAlign: 'center' }}>
              Add items together, then tap “Start shopping” to cross them off.
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
