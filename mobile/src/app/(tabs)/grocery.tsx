import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native'
import { useData } from '@/state/DataProvider'
import { PhotoHeader } from '@/components/Photo'
import { photos } from '@/lib/photos'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { Avatar } from '@/components/Avatar'
import { Checkbox } from '@/components/Checkbox'
import { Icon } from '@/components/Icon'
import { color, font, photoTextShadow, radius } from '@/theme/tokens'
import { GROCERY_STAPLES } from '@/data/seed'
import type { GroceryItem } from '@/types'

export default function GroceryScreen() {
  const { grocery, addGrocery, toggleGrocery, deleteGrocery, clearPurchased } = useData()
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
        <View style={styles.footer}>
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
  const pct = total > 0 ? inCart.length / total : 0
  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 64, paddingBottom: 140 }}>
        <View style={styles.body}>
          <View style={styles.shopHead}>
            <Txt variant="display">Shopping</Txt>
            <View style={styles.countPill}>
              <Txt variant="label" color={color.white}>
                {inCart.length} / {total}
              </Txt>
            </View>
          </View>
          <View style={styles.bar}>
            <View style={{ flex: pct, backgroundColor: color.leti }} />
            <View style={{ flex: 1 - pct }} />
          </View>

          {toBuy.length > 0 && (
            <>
              <Txt variant="eyebrow" style={{ marginTop: 8 }}>
                Still to get
              </Txt>
              <Card padded={false} style={{ overflow: 'hidden' }}>
                {toBuy.map((item, i) => (
                  <View key={item.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                    <Checkbox checked={false} tint={color.leti} size={26} onToggle={() => onToggle(item)} />
                    <Txt variant="body" style={{ flex: 1, fontSize: 16 }}>
                      {item.name}
                    </Txt>
                  </View>
                ))}
              </Card>
            </>
          )}

          {inCart.length > 0 && (
            <>
              <Txt variant="eyebrow" style={{ marginTop: 8 }}>
                In the cart
              </Txt>
              <Card padded={false} style={{ overflow: 'hidden' }}>
                {inCart.map((item, i) => (
                  <View key={item.id} style={[styles.row, i > 0 && styles.rowBorder]}>
                    <Checkbox checked tint={color.ink} size={26} onToggle={() => onToggle(item)} />
                    <Txt variant="body" color={color.muted} style={[{ flex: 1, fontSize: 16 }, styles.struck]}>
                      {item.name}
                    </Txt>
                  </View>
                ))}
              </Card>
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
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
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, backgroundColor: color.porcelain,
  },
  primary: {
    flexDirection: 'row', gap: 8, backgroundColor: color.ink, paddingVertical: 16,
    borderRadius: radius.button, alignItems: 'center', justifyContent: 'center',
  },
})
