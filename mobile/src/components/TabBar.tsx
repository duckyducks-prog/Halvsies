import { Pressable, StyleSheet, Text, View } from 'react-native'
import { BlurView } from 'expo-blur'
import { usePathname, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { color, font, radius } from '../theme/tokens'
import { Icon, type IconName } from './Icon'

const TABS: { path: string; icon: IconName; label: string }[] = [
  { path: '/', icon: 'today', label: 'Today' },
  { path: '/tasks', icon: 'tasks', label: 'Tasks' },
  { path: '/grocery', icon: 'grocery', label: 'Grocery' },
  { path: '/meals', icon: 'meals', label: 'Meals' },
]

/** Custom frosted tab bar with a raised center "add" button. Rendered on every screen. */
export function TabBar() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  // Pushed/modal screens map to their parent tab for highlighting.
  const activePath =
    pathname === '/balance'
      ? '/'
      : pathname === '/recipes' || pathname === '/add-dinner' || pathname === '/recipe'
        ? '/meals'
        : pathname === '/new-task'
          ? '/'
          : pathname

  const left = TABS.slice(0, 2)
  const right = TABS.slice(2)

  const item = ({ path, icon, label }: (typeof TABS)[number]) => {
    const focused = activePath === path
    return (
      <Pressable key={path} style={styles.item} onPress={() => router.navigate(path)}>
        <Icon name={icon} color={focused ? color.ink : color.faint} />
        <Text
          style={[
            styles.label,
            { fontFamily: focused ? font.bold : font.semibold, color: focused ? color.ink : color.faint },
          ]}>
          {label}
        </Text>
      </Pressable>
    )
  }

  return (
    <BlurView intensity={40} tint="light" style={[styles.bar, { paddingBottom: insets.bottom || 10 }]}>
      <View style={styles.row}>
        {left.map(item)}
        <Pressable style={styles.addWrap} onPress={() => router.push('/new-task')}>
          <View style={styles.add}>
            <Icon name="plus" color={color.white} size={26} />
          </View>
        </Pressable>
        {right.map(item)}
      </View>
    </BlurView>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.hairline,
    backgroundColor: 'rgba(248,247,243,0.94)',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingHorizontal: 8 },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 10 },
  addWrap: { width: 64, alignItems: 'center', justifyContent: 'center' },
  add: {
    width: 50,
    height: 50,
    borderRadius: radius.tabAdd,
    backgroundColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
})
