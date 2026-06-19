# Homebase 🏠

A simple, mobile-first, cloud-synced household app for two people (**Meg & Leti**),
built from their Chore Tracker spreadsheet. Installable as a PWA on iPhone & Android.

Modules:
- **Chores** ✅ (Phase 1 — done) — chores grouped by category, with frequency, owner,
  smart "due" tracking, owner/“due now” filters, and live sync across both phones.
- **Groceries** 🛒 (Phase 2 — planned) — shared shopping list.
- **Meals** 🍽️ (Phase 3 — planned) — weekly meal plan + “add ingredients to grocery list”.

## Tech stack
- React + TypeScript + Vite, Tailwind CSS, installable PWA (`vite-plugin-pwa`)
- Supabase (Postgres + Realtime + Auth) for cloud sync — **optional**: without keys the
  app runs in **local mode** (seeded localStorage, single device).

## Run it locally
```bash
npm install
npm run dev        # open the printed URL; use a phone-sized viewport
```
Out of the box it runs in **local mode** with the full chore list seeded — no backend needed.

## Enable cloud sync (both phones, live)
1. Create a free project at <https://supabase.com>.
2. In the SQL editor, run `supabase/migrations/0001_init.sql`, then `supabase/seed.sql`.
3. Enable an auth provider — **Authentication → Providers → Email** (magic link) is simplest.
   Add Meg's and Leti's emails (or allow sign-ups, then restrict).
4. Copy `.env.example` → `.env` and fill in:
   ```
   VITE_SUPABASE_URL=...        # Project Settings → API → Project URL
   VITE_SUPABASE_ANON_KEY=...   # Project Settings → API → anon public key
   ```
5. `npm run dev` again — changes now sync live across devices.

> Note: an auth gate UI (magic-link sign-in) is wired into the data layer via RLS but the
> sign-in screen lands with Phase 2; until then, relax the chores policies or sign in via the
> Supabase client if you enable RLS. In local mode no auth is required.

## Build & deploy
```bash
npm run build      # outputs static site to dist/
```
Deploy `dist/` to Vercel or Netlify (free). Set the two `VITE_*` env vars in the host's
dashboard for cloud sync in production.

## Project layout
```
supabase/migrations/0001_init.sql   # tables + RLS + realtime
supabase/seed.sql                   # members, categories, chores (from the sheet)
src/
  data/seed.ts        # the chore list (local-mode source + matches seed.sql)
  lib/frequency.ts    # due-date logic per frequency
  lib/supabase.ts     # client (null in local mode)
  hooks/useChores.ts  # data layer: Supabase + realtime, or localStorage fallback
  components/         # ChoreRow, CategorySection, OwnerBadge, FrequencyChip, AddChoreSheet, BottomNav
  pages/              # Chores, Settings, Placeholder (Groceries/Meals)
```
