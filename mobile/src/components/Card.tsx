import { View, type ViewProps } from 'react-native'
import { color, radius, shadow } from '../theme/tokens'

interface Props extends ViewProps {
  padded?: boolean
  raised?: boolean
}

export function Card({ padded = true, raised = false, style, ...rest }: Props) {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: color.surface,
          borderRadius: radius.card,
          padding: padded ? 14 : 0,
        },
        raised ? shadow.raised : shadow.card,
        style,
      ]}
    />
  )
}
