import Svg, { Path, Circle, Line } from 'react-native-svg'
import { color as tokens } from '../theme/tokens'

export type IconName = 'today' | 'tasks' | 'grocery' | 'meals' | 'plus' | 'bell' | 'chevron'

interface Props {
  name: IconName
  size?: number
  color?: string
  strokeWidth?: number
}

export function Icon({ name, size = 23, color = tokens.ink, strokeWidth = 1.7 }: Props) {
  const common = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'today' && (
        <>
          <Path d="M4 10.5 L12 4 L20 10.5" {...common} />
          <Path d="M6 9.5 V20 H18 V9.5" {...common} />
        </>
      )}
      {name === 'tasks' && (
        <>
          <Path d="M4 6.5 l2 2 l3 -3.5" {...common} />
          <Path d="M4 16.5 l2 2 l3 -3.5" {...common} />
          <Line x1="12" y1="6" x2="20" y2="6" {...common} />
          <Line x1="12" y1="17" x2="20" y2="17" {...common} />
        </>
      )}
      {name === 'grocery' && (
        <>
          <Path d="M3 4 h2 l2.2 11 h10 l1.8 -8 H6" {...common} />
          <Circle cx="9" cy="19" r="1.4" {...common} />
          <Circle cx="17" cy="19" r="1.4" {...common} />
        </>
      )}
      {name === 'meals' && (
        <>
          <Circle cx="12" cy="12" r="8" {...common} />
          <Circle cx="12" cy="12" r="3.2" {...common} />
        </>
      )}
      {name === 'plus' && (
        <>
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M6 16 V11 a6 6 0 0 1 12 0 v5 l1.5 2 H4.5 Z" {...common} />
          <Path d="M10 19 a2 2 0 0 0 4 0" {...common} />
        </>
      )}
      {name === 'chevron' && <Path d="M9 5 l7 7 l-7 7" {...common} />}
    </Svg>
  )
}
