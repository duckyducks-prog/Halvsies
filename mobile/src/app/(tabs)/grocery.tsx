import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useData } from '@/state/DataProvider'
import { FullBleedPhoto, PhotoHeader } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { GlassCard } from '@/components/GlassCard'
import { Avatar } from '@/components/Avatar'
import { Checkbox } from '@/components/Checkbox'
import { Icon } from '@/components/Icon'
import { color, font, glassTextShadow, photoTextShadow, radius } from '@/theme/tokens'
import { GROCERY_STAPLES } from '@/data/seed'
import type { GroceryItem } from '@/types'

export default function GroceryScreen() {
  const { grocery, addGrocery, toggleGrocery, deleteGrocery, clearPurchased } = useData()
  const insets = useSafeAreaInsets()
  const [text, setText] = useState('')
  const [shopping, setShopping] = useState(false)

  const toBuy = useMemo(() => grocery.filter((g) => g.status === 'toBuy'), [grocery])
  const inCart = useMemo(() => grocery.filter((g) => g.status === 'inCart'), [grocery])

  const submit = () => {
    addGrocery(text)
    setText('')
  }

  if (shopping) {
    return (
      <ShoppingView
        toBuy={toBuy}
        inCart={inCart}
        total={grocery.length}
        onToggle={toggleGrocery}
        onDone={() => {
          clearPurchased()
          setShopping(false)
        }}
      />
    )
  }

  const staples = GROCERY_STAPLES.filter(
    (s) => !grocery.some((g) => g.name.toLowerCase() === s.toLowerCase()),
  )

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        <PhotoHeader source={photos.grocery}>
          <Txt variant="display" color={color.white} style={photoTextShadow}>
            Grocery
          </Txt>
        </PhotoHeader>

        <View style={styles.body}>
          {/* Add field */}
          <View style={styles.addRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add an item…"
              placeholderTextColor={color.faint}
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            <Pressable style={styles.addBtn} onPress={submit}>
              <Icon name="plus" color={color.white} size={22} />
            </Pressable>
          </View>

          {/* Staple chips */}
          {staples.length > 0 && (
            <View style={styles.chips}>
              {staples.map((s) => (
                <Pressable key={s} style={styles.staple} onPress={() => addGrocery(s)}>
                  <Txt variant="label" color={color.muted}>
                    + {s}
                  </Txt>
                </Pressable>
              ))}
            </View>
          )}

          {grocery.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyCircle}>
                <Icon name="grocery" size={28} color={color.faint} />
              </View>
              <Txt variant="h2" style={{ marginTop: 12 }}>
                Nothing on the list yet
              </Txt>
              <Txt variant="meta" style={{ marginTop: 4 }}>
                Add items above or tap a staple.
              </Txt>
            </View>
          ) : (
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {grocery.map((item, i) => (
                <View key={item.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                  <Checkbox
                    checked={item.status === 'inCart'}
                    tint={color.leti}
                    size={24}
                    onToggle={() => toggleGrocery(item)}
                  />
                  <Txt
                    variant="bodyMed"
                    style={[{ flex: 1 }, item.status === 'inCart' && styles.struck]}
                    color={item.status === 'inCart' ? color.muted : color.ink}>
                    {item.name}
                  </Txt>
                  <Avatar owner={item.addedBy} size={18} />
                  <Pressable hitSlop={8} onPress={() => deleteGrocery(item.id)}>
                    <Icon name="trash" size={16} color={color.faint} />
                  </Pressable>
                </View>
              ))}
            </Card>
          )}
        </View>
      </ScrollView>

      {grocery.length > 0 && (
        <View style={[styles.footer, { bottom: insets.bottom + 78 }]}>
          <Pressable style={styles.primary} onPress={() => setShopping(true)}>
            <Icon name="grocery" color={color.white} size={20} />
            <Txt variant="label" color={color.white}>
              Start shopping
            </Txt>
          </Pressable>
        </View>
      )}
    </View>
  )
}

function ShoppingView({
  toBuy,
  inCart,
  total,
  onToggle,
  onDone,
}: {
  toBuy: GroceryItem[]
  inCart: GroceryItem[]
  total: number
  onToggle: (i: GroceryItem) => void
  onDone: () => void
}) {
  const insets = useSafeAreaInsets()
  const pct = total > 0 ? inCart.length / total : 0
  return (
    <View style={styles.root}>
      <FullBleedPhoto source={photos.grocery} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24 }}>
          <Txt style={[styles.wordmark, photoTextShadow]} color={color.white}>
            Halvsies
          </Txt>
          <View style={{ marginTop: 22 }}>
            <Txt variant="display" color={color.white} style={photoTextShadow}>
              Shopping
            </Txt>
            <Txt variant="bodyMed" color="rgba(255,255,255,0.92)" style={[{ marginTop: 4 }, photoTextShadow]}>
              {inCart.length} of {total} in the cart
            </Txt>
            <View style={styles.shopBar}>
              <View style={{ flex: pct, backgroundColor: color.white }} />
              <View style={{ flex: 1 - pct }} />
            </View>
          </View>
        </View>

        <View style={styles.shopBody}>
          <GlassCard padded={false}>
            {toBuy.length > 0 && (
              <>
                <Txt variant="eyebrow" color={color.meg} style={[styles.sectionLabel, glassTextShadow]}>
                  Still to get
                </Txt>
                {toBuy.map((item) => (
                  <View key={item.id} style={[styles.row, styles.rowBorder]}>
                    <Checkbox checked={false} tint={color.ink} size={26} onToggle={() => onToggle(item)} />
                    <Txt variant="body" style={[{ flex: 1, fontSize: 16 }, glassTextShadow]}>
                      {item.name}
                    </Txt>
                  </View>
                ))}
              </>
            )}
            {inCart.length > 0 && (
              <>
                <Txt variant="eyebrow" color={color.meg} style={[styles.sectionLabel, glassTextShadow]}>
                  In the cart
                </Txt>
                {inCart.map((item) => (
                  <View key={item.id} style={[styles.row, styles.rowBorder]}>
                    <Checkbox checked tint={color.ink} size={26} onToggle={() => onToggle(item)} />
                    <Txt variant="body" color={color.muted} style={[{ flex: 1, fontSize: 16 }, styles.struck, glassTextShadow]}>
                      {item.name}
                    </Txt>
                  </View>
                ))}
              </>
            )}
          </GlassCard>
        </View>
      </ScrollView>

      <View style={[styles.footerFloat, { bottom: insets.bottom + 78 }]}>
        <Pressable style={styles.primary} onPress={onDone}>
          <Txt variant="label" color={color.white}>
            Done shopping
          </Txt>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain },
  body: { paddingHorizontal: 24, paddingTop: 12, gap: 14 },
  addRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  input: {
    flex: 1, backgroundColor: color.surface, borderRadius: radius.button,
    paddingHorizontal: 14, paddingVertical: 13, fontFamily: font.regular, fontSize: 15, color: color.ink,
  },
  addBtn: {
    width: 46, height: 46, borderRadius: radius.button, backgroundColor: color.ink,
    alignItems: 'center', justifyContent: 'center',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  staple: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill,
    backgroundColor: color.surface, borderWidth: 1, borderColor: color.hairline,
  },
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyCircle: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#EFEAE0',
    alignItems: 'center', justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color.hairline },
  struck: { textDecorationLine: 'line-through' },
  shopHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countPill: { backgroundColor: color.leti, paddingHorizontal: 12, paddingVertical: 5, borderRadius: radius.pill },
  bar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: color.hairline },
  footer: {
    position: 'absolute', left: 0, right: 0,
    paddingHorizontal: 24, paddingTop: 10, paddingBottom: 10,
    backgroundColor: color.porcelain,
  },
  primary: {
    flexDirection: 'row', gap: 8, backgroundColor: color.ink, paddingVertical: 16,
    borderRadius: radius.button, alignItems: 'center', justifyContent: 'center',
  },
  wordmark: { fontFamily: 'Bricolage_700', fontSize: 15, letterSpacing: -0.3 },
  shopBar: {
    flexDirection: 'row', height: 6, borderRadius: 3, marginTop: 12, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  shopBody: { paddingHorizontal: 24, marginTop: 26 },
  sectionLabel: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  footerFloat: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28,
  },
})
