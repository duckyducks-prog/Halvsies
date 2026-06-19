// On-demand: one member nudges the other about a specific chore.
// Invoked from the app via supabase.functions.invoke('nudge', { body: { choreId, from } }).
import { adminClient } from '../_shared/clients.ts'
import { pushToMembers } from '../_shared/push.ts'
import { corsHeaders, json } from '../_shared/cors.ts'

const FRIENDLY = [
  "don't forget",
  'whenever you get a sec',
  'a little reminder',
  'thinking of you —',
]

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  let body: { choreId?: string; from?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { choreId, from } = body
  if (!choreId || (from !== 'Meg' && from !== 'Leti'))
    return json({ error: 'choreId and a valid `from` (Meg|Leti) are required' }, 400)

  const recipient = from === 'Meg' ? 'Leti' : 'Meg'
  const db = adminClient()

  const { data: chore, error } = await db
    .from('chores')
    .select('name')
    .eq('id', choreId)
    .maybeSingle()
  if (error) return json({ error: error.message }, 500)
  if (!chore) return json({ error: 'Chore not found' }, 404)

  const opener = FRIENDLY[Math.floor(Math.random() * FRIENDLY.length)]
  const sent = await pushToMembers(db, [recipient], {
    title: `${from} nudged you 👋`,
    body: `${opener} ${chore.name}`,
    url: '/',
    tag: `nudge-${choreId}`,
  })

  return json({ sent, recipient })
})
