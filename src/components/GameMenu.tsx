/** @format */

import { useState } from 'react'
import { CustomSettingsForm } from './CustomSettingsForm'
import { GameSettings } from '../types/GameSettings'

type GameMenuProps = {
  setSettings: React.Dispatch<React.SetStateAction<GameSettings | null>>
  setDidGameStart: React.Dispatch<React.SetStateAction<boolean>>
}

export function GameMenu({ setSettings, setDidGameStart }: GameMenuProps) {
  const [showCustomSettings, setShowCustomSettings] = useState(false)

  return (
    <section className="absolute left-0 top-0 w-screen h-screen p-2 bg-slate-500 bg-opacity-40 flex justify-center items-center">
      <div className="container lg:w-[32rem] grid grid-cols-1 gap-y-2">
        <button
          onClick={() => {
            setSettings({ width: 7, height: 10, density: 0.1 })
            setDidGameStart(true)
          }}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded cursor-pointer"
        >
          Easy
        </button>
        <button
          onClick={() => {
            setSettings({ width: 10, height: 14, density: 0.1 })
            setDidGameStart(true)
          }}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded cursor-pointer"
        >
          Normal
        </button>
        <button
          onClick={() => {
            setSettings({ width: 18, height: 28, density: 0.2 })
            setDidGameStart(true)
          }}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded cursor-pointer"
        >
          Hard
        </button>
        <button
          className="w-full px-4 py-2 bg-purple-500 text-white rounded cursor-pointer"
          onClick={() => setShowCustomSettings(!showCustomSettings)}
        >
          Custom
        </button>
        {showCustomSettings && <hr />}
        {showCustomSettings && (
          <CustomSettingsForm
            setSettings={setSettings}
            setDidGameStart={setDidGameStart}
          />
        )}
      </div>
    </section>
  )
}
