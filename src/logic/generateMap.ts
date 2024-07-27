/** @format */

import { getRandomIntInclusive } from './getRandomIntInclusive'

export type Cell = {
  id: string
  value: boolean | number
  isRevealed: boolean
}

function placeBombs(width: number, height: number, firstClickCoords: { x: number; y: number }): Cell[][] {
  const map: Cell[][] = []
  for (let y = 0; y < height; y++) {
    map[y] = []

    for (let x = 0; x < width; x++) {
      map[y].push({
        id: `${x}-${y}`,
        value: getRandomIntInclusive(0, 1) == 0 ? false : true,
        isRevealed: false,
      } as Cell)
    }
  }
  map[firstClickCoords.y][firstClickCoords.x].value = false

  return map
}

export function generateMap(width: number, height: number, firstClickCoords: { x: number; y: number }): Cell[][] {
  const map: Cell[][] = placeBombs(width, height, firstClickCoords)

  let count = 0
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (map[y][x].value === false) {
        count = 0

        if (y > 0 && x > 0 && map[y - 1][x - 1].value === true) count++
        if (y > 0 && map[y - 1][x].value === true) count++
        if (y > 0 && x < width - 1 && map[y - 1][x + 1].value === true) count++
        if (x > 0 && map[y][x - 1].value === true) count++
        if (x < width - 1 && map[y][x + 1].value === true) count++
        if (y < height - 1 && x > 0 && map[y + 1][x - 1].value === true) count++
        if (y < height - 1 && map[y + 1][x].value === true) count++
        if (y < height - 1 && x < width - 1 && map[y + 1][x + 1].value === true) count++

        map[y][x].value = count
      }
    }
  }

  return map
}
