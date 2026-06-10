import { useGameStore } from './store/gameStore'
import HomeScreen from './components/HomeScreen'
import ChallengeScreen from './components/ChallengeScreen'
import ResultScreen from './components/ResultScreen'
import SummaryScreen from './components/SummaryScreen'

function App() {
  const screen = useGameStore((s) => s.screen)

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
