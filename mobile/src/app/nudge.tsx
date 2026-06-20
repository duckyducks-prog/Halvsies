import { useMemo, useState } from 'react'
import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { useData } from '@/state/DataProvider'
import { Txt } from '@/components/Txt'
import { Card } from '@/components/Card'
import { Avatar } from '@/components/Avatar'
import { Icon } from '@/components/Icon'
import { TabBar } from '@/components/TabBar'
import { color, radius } from '@/theme/tokens'
import { partnerOf } from '@/lib/identity'
import type { MemberName } from '@/types'

// Warm, never-naggy one-liners. {to} is the recipient.
const TEMPLATES = [
  'Hey {to}, got a sec to knock out a chore with me? 💛',
  'No rush {to} — whenever you have a moment, a little help would be lovely.',
  '{to}, teaming up on the list would make today so much lighter. 🤝',
  'Thinking of you, {to}! Mind grabbing one off the list when you can?',
  'A tiny nudge, {to} — we’ve got this together. ✨',
]

export default function NudgeSheet() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { currentMember } = useData()
  const { to } = useLocalSearchParams<{ to?: string }>()

  const recipient: MemberName = to === 'Meg' || to === 'Leti' ? to : partnerOf(currentMember)
  const [idx, setIdx] = useState(0)
  const [sent, setSent] = useState(false)

  const message = useMemo(() => TEMPLATES[idx].replace('{to}', recipient), [idx, recipient])

  const rewrite = () => {
    if (Platform.OS !== 'web') void Haptics.selectionAsync()
    setIdx((i) => (i + 1) % TEMPLATES.length)
  }

  const send = () => {
    if (Platform.OS !== 'web') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    // Real push delivery arrives with the notifications phase (Expo push tokens +
    // the `nudge` Edge Function). For now this confirms locally.
    setSent(true)
    setTimeout(() => router.back(), 1100)
  }

  return (
    <View style={styles.root}>
      <View style={styles.grabber} />
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Txt variant="label" color={color.muted}>
            Cancel
          </Txt>
        </Pressable>
        <Txt variant="h2">Nudge</Txt>
        <View style={{ width: 48 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.toRow}>
          <Avatar owner={recipient} size={34} />
          <View>
            <Txt variant="eyebrow">To</Txt>
            <Txt variant="h2">{recipient}</Txt>
          </View>
        </View>

        {sent ? (
          <Card style={styles.sentCard}>
            <View style={styles.sentCircle}>
              <Icon name="check" size={26} color={color.white} />
            </View>
            <Txt variant="bodyMed" style={{ marginTop: 12 }}>
              Nudge sent to {recipient} 💛
            </Txt>
          </Card>
        ) : (
          <>
            <Card style={{ gap: 14 }}>
              <Txt variant="body" style={{ lineHeight: 22, fontSize: 16 }}>
                {message}
              </Txt>
              <Pressable style={styles.rewrite} onPress={rewrite} hitSlop={6}>
                <Icon name="repeat" size={15} color={color.leti} />
                <Txt variant="label" color={color.leti}>
                  Rewrite
                </Txt>
              </Pressable>
            </Card>

            <Pressable style={styles.send} onPress={send}>
              <Icon name="send" size={18} color={color.white} />
              <Txt variant="label" color={color.white}>
                Send nudge
              </Txt>
            </Pressable>

            <Txt variant="meta" style={{ textAlign: 'center' }}>
              A friendly heads-up — never naggy.
            </Txt>
          </>
        )}
      </View>
      <View style={{ height: insets.bottom + 90 }} />
      <TabBar />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: color.porcelain, paddingTop: 10 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: color.hairline },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  body: { paddingHorizontal: 24, gap: 18 },
  toRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rewrite: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  send: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: color.ink,
    paddingVertical: 16,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentCard: { alignItems: 'center', paddingVertical: 28 },
  sentCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.leti,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
