import { create } from 'zustand'
import { createFishSlice } from '../../src/store/slices/fishSlice'
import { IFish } from '../../src/models/types/fish'
import { describe, it, expect } from 'vitest'

describe('Fish slice', () => {
  it('starts empty and allows adding and removing fish', () => {
    const useTestStore = create(createFishSlice)

    const fish: IFish = {
      id: 'f1',
      x: 10,
      y: 20,
      vx: 0,
      vy: 0,
      scale: 1,
      color: '#ffffff',
      width: 10,
      height: 5,
      mass: 1,
      radius: 5,
      update: () => {},
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
