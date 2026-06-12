import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { useGameStore } from './store/gameStore'
import HomeScreen from './components/HomeScreen'
import ChallengeScreen from './components/ChallengeScreen'
import ResultScreen from './components/ResultScreen'
import SummaryScreen from './components/SummaryScreen'

function App() {
  const screen = useGameStore((s) => s.screen)

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(swUrl, registration) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000)
      }
    },
  })

  useEffect(() => {
    if (needRefresh) {
      updateServiceWorker(true)
    }
  }, [needRefresh, updateServiceWorker])

  return (
    <div className="min-h-[100svh] flex flex-col bg-dark-bg scan-line">
      {screen === 'home' && <HomeScreen />}
      {screen === 'challenge' && <ChallengeScreen />}
      {screen === 'result' && <ResultScreen />}
      {screen === 'summary' && <SummaryScreen />}
    </div>
  )
}

export default App
