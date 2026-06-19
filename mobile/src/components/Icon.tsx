import { color as tokens } from '../theme/tokens'
import Home from '@/assets/icons/home.svg'
import List from '@/assets/icons/list.svg'
import Cart from '@/assets/icons/cart.svg'
import Meal from '@/assets/icons/meal.svg'
import Plus from '@/assets/icons/plus.svg'
import Bell from '@/assets/icons/bell.svg'
import Check from '@/assets/icons/check.svg'
import Spark from '@/assets/icons/spark.svg'
import Chev from '@/assets/icons/chev.svg'
import ChevL from '@/assets/icons/chevL.svg'
import Repeat from '@/assets/icons/repeat.svg'
import Clock from '@/assets/icons/clock.svg'
import Note from '@/assets/icons/note.svg'
import Edit from '@/assets/icons/edit.svg'
import Trash from '@/assets/icons/trash.svg'
import Send from '@/assets/icons/send.svg'

const MAP = {
  today: Home,
  tasks: List,
  grocery: Cart,
  meals: Meal,
  plus: Plus,
  bell: Bell,
  check: Check,
  spark: Spark,
  chevron: Chev,
  chevronLeft: ChevL,
  repeat: Repeat,
  clock: Clock,
  note: Note,
  edit: Edit,
  trash: Trash,
  send: Send,
} as const

export type IconName = keyof typeof MAP

interface Props {
  name: IconName
  size?: number
  color?: string
}

export function Icon({ name, size = 23, color = tokens.ink }: Props) {
  const Svg = MAP[name]
  return <Svg width={size} height={size} color={color} />
}
