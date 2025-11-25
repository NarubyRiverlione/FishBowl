import { IFishLogic, ITankLogic } from '../../models/types'

export const resolveBoundaryCollision = (fish: IFishLogic, tank: ITankLogic): void => {
  // Tank logic should handle boundary resolution
  tank.resolveBoundary(fish)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const detectFishCollision = (_f1: IFishLogic, _f2: IFishLogic): boolean => {
  // T044a: Fish-to-fish collision disabled for 3D depth illusion
  // This allows visual overlap for more natural looking tank
  return false
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const resolveFishCollision = (_f1: IFishLogic, _f2: IFishLogic): void => {
  // T044a: Fish-to-fish collision disabled to allow visual overlap for 3D depth illusion
  // This function is kept for API compatibility but does nothing
  return
}

export default {
  detectFishCollision,
  resolveBoundaryCollision,
  resolveFishCollision,
}
