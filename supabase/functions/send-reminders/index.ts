// Scheduled (pg_cron, ~every 15 min): push a reminder for each due chore whose
// owner opted in, then stamp last_reminded_at so it won't re-fire this cycle.
import { adminClient } from '../_shared/clients.ts'
import { pushToMembers } from '../_shared/push.ts'
import { shouldRemind, type ChoreRow } from '../_shared/due.ts'
import { corsHeaders, json } from '../_shared/cors.ts'

function recipients(owner: string): string[] {
  return owner === 'Both' ? ['Meg', 'Leti'] : [owner]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const db = adminClient()
  const now = new Date()

  const { data, error } = await db.from('chores').select('*').eq('reminder_enabled', true)
  if (error) return json({ error: error.message }, 500)

  const due = (data as ChoreRow[]).filter((c) => shouldRemind(c, now))

  let notified = 0
  for (const chore of due) {
    const sent = await pushToMembers(db, recipients(chore.owner), {
      title: 'Chore due 🧹',
      body: `${chore.name} is due`,
      url: '/',
      tag: `due-${chore.id}`,
    })
    if (sent > 0) notified++
    await db.from('chores').update({ last_reminded_at: now.toISOString() }).eq('id', chore.id)
  }

  return json({ checked: due.length, notified })
})
