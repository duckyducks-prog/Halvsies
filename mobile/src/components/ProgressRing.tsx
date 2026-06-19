import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { color, font } from '../theme/tokens'
import { Txt } from './Txt'

interface Props {
  done: number
  total: number
  size?: number
  stroke?: number
  tint?: 'ink' | 'light'
}

export function ProgressRing({ done, total, size = 58, stroke = 5, tint = 'ink' }: Props) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = total > 0 ? Math.min(done / total, 1) : 0
  const fg = tint === 'light' ? color.white : color.ink
  const track = tint === 'light' ? 'rgba(255,255,255,0.35)' : color.hairline
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={fg}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Txt style={{ fontFamily: font.display, fontSize: 15, color: fg }}>
          {done}/{total}
        </Txt>
      </View>
    </View>
  )
}
