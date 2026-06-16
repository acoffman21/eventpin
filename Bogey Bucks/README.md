# Bogey Bucks ⛳️💸

> **Track the bets. Settle the scores. Own the crew.**

A vibey, mobile-first PWA for golf betting and group tracking. Score your round
hole-by-hole, run Skins / Nassau / Match Play side bets, auto-calculate
"who owes who," and keep a crew leaderboard with badges and rivalries.

This is the **MVP frontend** — no backend yet. Everything persists to
`localStorage` so rounds, groups, and leaderboards survive a refresh and work
offline.

## Tech Stack

- **React 19 + TypeScript + Vite 6** — fast single-page app
- **Tailwind CSS v4** — golf-green/dark theme with gold betting accents
- **Zustand** (`persist` middleware) — state + localStorage persistence
- **vite-plugin-pwa** — installable, offline-friendly PWA (manifest + SW)
- **react-router-dom** — screen routing

## Getting Started

```bash
npm install
npm run dev      # start dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## Project Structure

```
src/
  App.tsx               # App shell: routing + header
  main.tsx              # Entry (BrowserRouter)
  index.css            # Tailwind v4 theme tokens + animations
  types/index.ts        # All domain types (Course, Round, Game, etc.)
  data/
    courses.ts          # Keene Trace · Keene Run + Champions Trace (Par 72)
    seed.ts             # Seed groups + player profiles
  store/useStore.ts     # Zustand store w/ localStorage persistence
  lib/
    scoring.ts          # Stroke allocation, skins/nassau/match, settlements
    leaderboard.ts      # Aggregates completed rounds → leaderboard rows
    quips.ts            # Fun golf/betting notification text
  components/
    ui.tsx              # Button, Card, Pill, etc.
    Toast.tsx           # Toast provider for vibey notifications
  screens/
    Dashboard.tsx       # Home: groups, start round, recent rounds
    NewRound.tsx        # 4-step round setup wizard
    LiveScoring.tsx     # Hole-by-hole scoring + live money tracker
    RoundSummary.tsx    # Scorecard, results, settlement, share
    Leaderboard.tsx     # All-Time / Season / By-Course standings
```

## Features

- **Dashboard** — crews, prominent *Start New Round*, resumable active rounds,
  recent results, quick leaderboard access.
- **Start New Round** — pick group → course (Keene Run / Champions Trace) →
  2–4 players (name, handicap index 0–36, GHIN placeholder) → game type with
  bet amount, press toggle, and gross/net scoring.
- **Live Scoring** — hole nav + progress bar, par + stroke index, ±1 buttons and
  a number pad, optional putts/FIR/GIR, a live game leaderboard, and a real-time
  money tracker. Fun toasts fire on birdies, bogeys, eagles, and blow-ups.
- **Round Summary** — hole-by-hole scorecard vs par, gross/net totals, game
  results, minimal "who owes who" settlements, and one-tap share.
- **Leaderboard** — All-Time / This Season / By Course tabs with rounds, money
  net, win rate, average gross/net, top-performer card, badges, and a rivalry
  head-to-head.

## Betting Logic Notes

- **Handicaps (MVP):** course handicap is simplified to `round(handicapIndex)`.
  Net scores allocate strokes by stroke index (hardest holes first).
- **Skins:** lowest (gross or net) score wins the hole; ties carry over.
- **Nassau:** Front 9 / Back 9 / Total 18, each worth the bet amount;
  round-robin for >2 players.
- **Match Play:** hole-by-hole; round-robin of 1-on-1 matches for >2 players.
- **Settlements:** greedy min-cash-flow ("who owes who") to minimize transfers.

## Future Expansion (search the code for `FUTURE EXPANSION`)

- **Backend / cloud sync** — swap the localStorage adapter in
  `store/useStore.ts` for Firebase / Supabase to sync across the crew.
- **Real course API** — replace approximate stroke indexes & yardages in
  `data/courses.ts` with official scorecard data; add per-tee yardages.
- **GHIN integration** — populate `Player.ghin` and derive course handicap from
  the official index + slope/rating.
- **Course handicap formula** — `round(index * slope / 113) + (rating - par)`.
- **AI highlights + Suno parody audio** — auto-generate recap commentary and
  music from a round's notable moments (`lib/quips.ts` is the seed).
- **Branded recap image / PDF export** — the share button currently uses the
  Web Share API with a text/clipboard fallback.
- **3D print exports** — turn a signature round into a printable trophy.
- **Family mode** — kid-friendly scoring for rounds with Jim Bob. 👨‍👦

---

Built for Andy and the crew. Now go make it interesting. 😏
