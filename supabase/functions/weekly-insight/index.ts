// Scheduled (pg_cron, weekly): compute the week's chore balance, ask Claude for
// a warm one-liner, and cache it in `insights` for the app to read.
import Anthropic from 'npm:@anthropic-ai/sdk'
import { adminClient } from '../_shared/clients.ts'
import { isDue, type ChoreRow } from '../_shared/due.ts'
import { corsHeaders, json } from '../_shared/cors.ts'

const MEMBERS = ['Meg', 'Leti', 'Both'] as const
type Bucket = Record<(typeof MEMBERS)[number], number>
const emptyBucket = (): Bucket => ({ Meg: 0, Leti: 0, Both: 0 })

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

const SYSTEM = `You are the gentle "household coach" for a two-person home (Meg & Leti).
Given this week's chore stats, write ONE short, warm sentence (max ~30 words) about how the
week went and how to keep things balanced. Be specific and kind — celebrate effort, and if one
person carried more, suggest evening it out or doing something nice for them. Never guilt-trip,
never scold, no preamble, no lists. You may use at most one tasteful emoji.`

function mondayOf(now: Date): string {
  const diff = (now.getUTCDay() + 6) % 7 // days since Monday (UTC)
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff),
  )
  return monday.toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY is not set' }, 500)

  const db = adminClient()
  const now = new Date()

  const { data, error } = await db.from('chores').select('*')
  if (error) return json({ error: error.message }, 500)
  const chores = data as ChoreRow[]

  const completedLast7 = emptyBucket()
  const openOverdue = emptyBucket()
  const totalAssigned = emptyBucket()

  for (const c of chores) {
    const owner = c.owner as keyof Bucket
    if (!(owner in totalAssigned)) continue
    totalAssigned[owner]++
    if (c.last_done_at && now.getTime() - new Date(c.last_done_at).getTime() <= WEEK_MS) {
      completedLast7[owner]++
    }
    if (isDue(c, now) && !c.done) openOverdue[owner]++
  }

  const stats = {
    week_start: mondayOf(now),
    completed_last_7_days: completedLast7,
    open_overdue: openOverdue,
    total_assigned: totalAssigned,
  }

  const client = new Anthropic({ apiKey })
  const msg = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 400,
    output_config: { effort: 'low' },
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `This week's household chore stats (JSON):\n${JSON.stringify(
          stats,
          null,
          2,
        )}\n\nWrite the weekly note.`,
      },
    ],
  })

  const text = msg.content
    .filter((b): b is { type: 'text'; text: string } => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  if (!text) return json({ error: 'Empty response from Claude', stop_reason: msg.stop_reason }, 502)

  const { error: upsertErr } = await db
    .from('insights')
    .upsert({ week_start: stats.week_start, text }, { onConflict: 'week_start' })
  if (upsertErr) return json({ error: upsertErr.message }, 500)

  return json({ week_start: stats.week_start, text })
})
