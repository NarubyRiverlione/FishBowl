import { create } from 'zustand'
import { createFishSlice } from '../../src/store/slices/fishSlice'
import type { IFishData } from '../../src/models/types/fish'
import { FishSpecies } from '../../src/models/types'
import { describe, it, expect } from 'vitest'

describe('Fish slice', () => {
  it('starts empty and allows adding and removing fish', () => {
    const useTestStore = create(createFishSlice)

    const fish: IFishData = {
      id: 'f1',
      species: FishSpecies.GUPPY,
      color: '#ffffff',
      size: 1,
      age: 0,
      health: 100,
      hunger: 0,
      isAlive: true,
      genetics: {},
      createdAt: Date.now(),
      geometry: {
        position: { x: 10, y: 20 },
        velocity: { vx: 0, vy: 0 },
        radius: 5,
      },
    }

    // initial state
    const initial = useTestStore.getState()
    expect(initial.fish).toEqual({})

    // add fish
    useTestStore.getState().addFish(fish)
    const afterAdd = useTestStore.getState()
    expect(afterAdd.fish[fish.id]).toEqual(fish)

    // remove fish
    useTestStore.getState().removeFish(fish.id)
    const afterRemove = useTestStore.getState()
    expect(afterRemove.fish[fish.id]).toBeUndefined()
  })
})
