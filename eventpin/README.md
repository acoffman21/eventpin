# Pin the Event — Pin the Past

> Where did history happen? A daily history pinning game inspired by GeoGuessr, built as a mobile-first PWA.

## Quick Start

```bash
cd eventpin

# Install dependencies
npm install

# If you get native binding errors, also run:
npm install @tailwindcss/oxide-darwin-x64 @rollup/rollup-darwin-x64 lightningcss-darwin-x64

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open `http://localhost:5173` on your phone (same WiFi) or in a mobile browser simulator.

To expose on your local network for phone testing:
```bash
npx vite --host
```

## How It Works

1. **5 daily challenges** — same for everyone worldwide (seeded by UTC date)
2. **View clue + image** — a historical photo/painting with a neutral text clue
3. **Tap the map** — drop your pin where you think the event happened
4. **Submit** — see your distance, score, and fun facts about the event
5. **Daily reset** — come back tomorrow. Build your streak!

## Scoring

| Distance       | Points |
|----------------|--------|
| < 50 km        | 1000 (perfect!) |
| 50-5000 km     | Linear scale down to 0 |
| > 5000 km      | 0 |

**Bonuses:**
- Speed: < 10s (+100), < 20s (+50), < 30s (+25)
- Difficulty multiplier: Easy (1.0x), Medium (1.1x), Hard (1.3x)
- Streak multiplier: +5% per day (up to +50%)

## Tech Stack

- **React 19** + **Vite 6**
- **Leaflet.js** + OpenStreetMap tiles
- **Tailwind CSS 4** (mobile-first)
- **Zustand** for state management
- **Vite PWA Plugin** (service worker + manifest)
- **html2canvas-pro** for share card generation

## Project Structure

```
eventpin/
├── public/
│   ├── favicon.svg
│   ├── icon-192.svg
│   └── icon-512.svg
├── src/
│   ├── components/
│   │   ├── HomeScreen.jsx      # Daily progress, streaks, how-to-play
│   │   ├── ChallengeScreen.jsx # Image/clue + interactive Leaflet map
│   │   ├── ResultScreen.jsx    # Score animation, distance, facts
│   │   └── SummaryScreen.jsx   # Daily summary, share buttons
│   ├── data/
│   │   └── events.json         # 60 curated historical events
│   ├── store/
│   │   └── gameStore.js        # Zustand store with all game logic
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css               # Tailwind + Leaflet + animations
├── index.html
├── vite.config.js
└── package.json
```

## Installing as PWA

1. Open the app in Chrome (Android) or Safari (iOS)
2. **Android:** Tap the three-dot menu > "Add to Home screen"
3. **iOS:** Tap the share button > "Add to Home Screen"
4. The app will work offline with cached map tiles and challenges

## Deploying

### Vercel
```bash
npm run build
# Push to GitHub, connect repo in Vercel dashboard
# Or: npx vercel --prod
```

### Netlify
```bash
npm run build
# Drag the dist/ folder to Netlify, or connect your repo
```

## Expansion Prompts

Use these prompts with AI to extend the app:

### Add more events via AI
> "Generate 50 more historical events for my Pin the Event game in the same JSON format. Include events from: Sub-Saharan Africa, Southeast Asia, Oceania, and pre-Columbian Americas. Each needs: id, title, year, clue (neutral, doesn't name the location), lat, lng, description, facts (array of 2), image (Wikimedia Commons URL), difficulty (easy/medium/hard), era, region. Ensure geographic and temporal diversity."

### Add Firebase backend
> "Add Firebase to my Pin the Event React app for: (1) Anonymous auth on first visit, (2) Firestore to store daily scores and streaks, (3) Real-time global leaderboard showing top 100 daily scores, (4) Friend codes so users can compare with friends. Keep the offline-first localStorage approach as fallback. Use Firebase v9 modular SDK."

### Add user-submitted events
> "Add a 'Submit Event' form to Pin the Event where users can propose new historical events. Store submissions in Firestore with a 'pending' status. Add an admin dashboard to review/approve submissions. Approved events get added to a 'community' pool that supplements the curated events."

### Add difficulty modes
> "Add three difficulty modes to Pin the Event: (1) Explorer mode shows the event name and a zoomed-in map, (2) Standard mode is the current behavior with image + clue, (3) Expert mode has text clue only, no image, wider scoring range. Let users pick their mode from the home screen. Track separate streaks and leaderboards per mode."

### Add multiplayer
> "Add a real-time multiplayer mode to Pin the Event using WebSockets (Socket.io). Players join a room with a code, see the same 5 events simultaneously, and race to pin them. Show live opponent pins after both submit. Score includes both accuracy and speed relative to opponent."

### Add sound effects and haptics
> "Add satisfying sound effects and haptic feedback to Pin the Event: pin drop sound, score counting up, perfect score fanfare, streak fire crackle. Use Web Audio API for sounds and navigator.vibrate for haptics. Include a mute toggle in settings. Keep file sizes small (use synthesized audio where possible)."
