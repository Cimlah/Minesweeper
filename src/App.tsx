/** @format */

import { useState } from 'react'
import { GameSettings } from './types/GameSettings'
import { GameMenu } from './components/GameMenu'

// type FirstClickCoords = null | { x: number; y: number }

function App() {
  // const [map, setMap] = useState<null | Cell[][]>(null)
  const [didGameStart, setDidGameStart] = useState(false)
  const [settings, setSettings] = useState<null | GameSettings>(null)

  console.log(settings)

  return (
    <>
      {!didGameStart && (
        <GameMenu
          setDidGameStart={setDidGameStart}
          setSettings={setSettings}
        />
      )}
    </>
  )
}

export default App
