/** @format */

import { useEffect, useState } from 'react'
import { GameSettings } from '../types/GameSettings'

enum ErrorMessages {
  width = 'Width: 2 - 10000',
  height = 'Height: 2 - 10000',
  density = 'Density: 0.1 - 0.9',
}
type CustomSettingsError = {
  message: ErrorMessages
  lowRange: number
  highRange: number
  show: boolean | null
}
type CustomSettingsErrors = {
  width: CustomSettingsError
  height: CustomSettingsError
  density: CustomSettingsError
}

type CustomSettingsFormProps = {
  setSettings: React.Dispatch<React.SetStateAction<GameSettings | null>>
  setDidGameStart: React.Dispatch<React.SetStateAction<boolean>>
}

export function CustomSettingsForm({ setSettings, setDidGameStart }: CustomSettingsFormProps) {
  const [showCustomSettingsErrors, setShowCustomSettingsErrors] = useState<CustomSettingsErrors>({
    width: { message: ErrorMessages.width, lowRange: 2, highRange: 10000, show: null },
    height: { message: ErrorMessages.height, lowRange: 2, highRange: 10000, show: null },
    density: { message: ErrorMessages.density, lowRange: 0.1, highRange: 0.9, show: null },
  })
  const [formData, setFormData] = useState<GameSettings | null>(null)

  function handleCustomSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = Object.fromEntries(new FormData(e.currentTarget).entries())

    function showErrors() {
      const inputs = e.currentTarget.querySelectorAll('input')
      inputs.forEach((input) => {
        const id = input.id as keyof CustomSettingsErrors
        const value = Number(input.value)

        input.placeholder = showCustomSettingsErrors[id].message

        setShowCustomSettingsErrors((prev) => {
          const isError = value < prev[id].lowRange || value > prev[id].highRange
          const updatedErrors = {
            ...prev,
            [id]: { ...prev[id], show: isError },
          }

          if (isError) {
            input.value = ''
            input.classList.remove('placeholder-transparent')
            input.classList.add('placeholder-red-500')
          } else {
            input.classList.remove('placeholder-red-500')
            input.classList.add('placeholder-transparent')
          }

          return updatedErrors
        })
      })
    }
    showErrors()

    function getFormData() {
      setShowCustomSettingsErrors((prev) => {
        const state = { ...prev }

        if (Object.values(state).every((error) => error.show === false)) {
          const customSettings: GameSettings = {
            width: Number(formData.width),
            height: Number(formData.height),
            density: Number(formData.density),
          }
          setFormData(customSettings)
        }

        return state
      })
    }
    getFormData()
  }

  useEffect(() => {
    if (formData) {
      setSettings(formData)
      setDidGameStart(true)
    }
  }, [formData, setSettings, setDidGameStart])

  return (
    <form
      onSubmit={handleCustomSettings}
      className="grid grid-cols-2 gap-y-2"
    >
      <label htmlFor="width">Width:</label>
      <input
        id="width"
        name="width"
        type="number"
        className="text-right rounded outline-purple-500 border-none"
      />
      <label htmlFor="height">Height:</label>
      <input
        id="height"
        name="height"
        type="number"
        className="text-right rounded outline-purple-500 border-none"
      />
      <label htmlFor="density">Density:</label>
      <input
        id="density"
        name="density"
        type="number"
        step={0.1}
        className="text-right rounded outline-purple-500 border-none"
      />
      <button
        type="submit"
        className="col-span-2 bg-green-500 rounded text-white px-4 py-2 cursor-pointer"
      >
        Start
      </button>
    </form>
  )
}
