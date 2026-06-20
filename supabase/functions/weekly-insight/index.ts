// Scheduled (pg_cron, weekly): compute the week's chore balance for the Halvsies
// mobile app and ask Claude for a warm one-liner, cached in `insights` for the app.
//
// Reads the mobile schema: per-member completions from `completions` (the source
// of truth for the Balance split) + task load per owner from `tasks`.
import Anthropic from 'npm:@anthropic-ai/sdk'
import { adminClient } from '../_shared/clients.ts'
import { corsHeaders, json } from '../_shared/cors.ts'

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

interface CompletionRow { member: string; at: string }
interface TaskRow { owner: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) return json({ error: 'ANTHROPIC_API_KEY is not set' }, 500)

  const db = adminClient()
  const now = new Date()
  const since = new Date(now.getTime() - WEEK_MS).toISOString()

  const [{ data: comps, error: compErr }, { data: tasks, error: taskErr }] = await Promise.all([
    db.from('completions').select('member, at').gte('at', since),
    db.from('tasks').select('owner'),
  ])
  if (compErr) return json({ error: compErr.message }, 500)
  if (taskErr) return json({ error: taskErr.message }, 500)

  const completedLast7 = { Meg: 0, Leti: 0 }
  for (const c of (comps as CompletionRow[]) ?? []) {
    if (c.member === 'Meg' || c.member === 'Leti') completedLast7[c.member]++
  }

  const tasksByOwner = { Meg: 0, Leti: 0, Both: 0 }
  for (const t of (tasks as TaskRow[]) ?? []) {
    if (t.owner === 'Meg' || t.owner === 'Leti' || t.owner === 'Both') tasksByOwner[t.owner]++
  }

  const stats = {
    week_start: mondayOf(now),
    completed_last_7_days: completedLast7,
    tasks_assigned: tasksByOwner,
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
