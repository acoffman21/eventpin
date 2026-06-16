import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import { useStore } from './store/useStore'
import Dashboard from './screens/Dashboard'
import NewRound from './screens/NewRound'
import LiveScoring from './screens/LiveScoring'
import RoundSummary from './screens/RoundSummary'
import Leaderboard from './screens/Leaderboard'

/**
 * App shell: routing + glassy header + modern bottom tab bar.
 *
 * Routes:
 *   /                       → Dashboard (groups, start round, leaderboard CTA)
 *   /new                    → Start New Round flow
 *   /round/:roundId         → Live scoring
 *   /round/:roundId/summary → Round summary + settlement
 *   /leaderboard/:groupId   → Group leaderboard
 */
export default function App() {
  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-full max-w-md flex-col">
        <Header />
        <main className="flex-1 px-4 pb-32">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new" element={<NewRound />} />
            <Route path="/round/:roundId" element={<LiveScoring />} />
            <Route path="/round/:roundId/summary" element={<RoundSummary />} />
            <Route path="/leaderboard/:groupId" element={<Leaderboard />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  )
}

function Header() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-white/5 bg-fairway-950/70 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 py-3.5">
        {!isHome ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 rounded-xl px-2 py-1.5 text-sm font-semibold text-fairway-200 transition-colors hover:bg-white/5 active:scale-95"
            aria-label="Back"
          >
            <span className="text-lg leading-none">‹</span> Back
          </button>
        ) : (
          <span className="w-16" />
        )}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 font-display text-lg font-extrabold tracking-tight"
        >
          <span className="animate-float">⛳️</span>
          <span className="text-white">Bogey</span>
          <span className="text-metal-gold">Bucks</span>
        </button>
        <span className="w-16" />
      </div>
    </header>
  )
}

function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const groups = useStore((s) => s.groups)
  const firstGroupId = groups[0]?.id

  // Hide the tab bar during active scoring for a focused, full-screen feel.
  const isScoring =
    pathname.startsWith('/round/') && !pathname.endsWith('/summary')
  if (isScoring) return null

  const tabs = [
    {
      key: 'home',
      label: 'Home',
      icon: '🏠',
      path: '/',
      match: (p: string) => p === '/',
      primary: false,
    },
    {
      key: 'play',
      label: 'Play',
      icon: '⛳️',
      path: '/new',
      match: (p: string) => p.startsWith('/new') || p.startsWith('/round'),
      primary: true,
    },
    {
      key: 'board',
      label: 'Crew',
      icon: '🏆',
      path: firstGroupId ? `/leaderboard/${firstGroupId}` : '/',
      match: (p: string) => p.startsWith('/leaderboard'),
      primary: false,
    },
  ]

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-3">
      <div className="ring-grad glass flex w-full max-w-md items-center justify-around gap-1 rounded-3xl px-2 py-2 shadow-2xl shadow-black/50">
        {tabs.map((t) => {
          const active = t.match(pathname)
          if (t.primary) {
            return (
              <button
                key={t.key}
                onClick={() => navigate(t.path)}
                className="sheen -mt-7 flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-2xl bg-gradient-to-b from-gold-400 to-gold-600 text-fairway-950 shadow-lg shadow-gold-500/40 ring-2 ring-fairway-950 transition-transform active:scale-90"
              >
                <span className="text-2xl leading-none">{t.icon}</span>
                <span className="text-[10px] font-bold">{t.label}</span>
              </button>
            )
          }
          return (
            <button
              key={t.key}
              onClick={() => navigate(t.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 transition-all active:scale-90 ${
                active ? 'text-gold-300' : 'text-fairway-300/60'
              }`}
            >
              <span
                className={`text-xl leading-none transition-transform ${
                  active ? 'scale-110' : ''
                }`}
              >
                {t.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide">
                {t.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
