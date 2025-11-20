#High-level summary

Zustand is the global app store in this project (no Provider needed). The store is created in useGameStore.ts by composing multiple slice creators: createTankSlice, createFishSlice, and createGameSlice. Each slice exposes state plus actions (functions that call set/get).
Business logic (pure domain operations) lives in services and models (e.g., FishService.ts, EconomyService.ts, src/models/\*). The store calls those services to perform domain updates, then persists the result into the store.
Components read and write state via the useGameStore hook (with selectors) or — in non-React code like Pixi sprites — via useGameStore.getState().
Why this pattern (vs old Redux / useReducer)

Less boilerplate: slices + actions are defined inline with set/get, no reducers/switch statements or Providers.
Selectors avoid unnecessary re-renders: components call useGameStore(state => state.someValue) to subscribe only to the piece they need.
Actions are just functions on the store (no dispatch(action) wrapper), which feels similar to “bound action creators” in Redux.
Easy to call from non-React code: useGameStore.getState() lets Pixi renderer or services access the current state or call actions without React context.
Concrete examples from this repo (how pieces fit)

#Store composition
useGameStore.ts
Combines slices:
...createTankSlice(...) -> manages tanks, tank, and tank-related actions (buyFish, sellFish, feedTank, etc.)
...createFishSlice(...) -> fish-specific slice (if present)
...createGameSlice(...) -> global state (credits, selectedFishId, sellMode, tick, etc.)
Domain services
FishService.ts
Pure functions like createFish, tickFish, calculateFishValue. These compute new fish state or values without touching React/Zustand directly.
Example flow: ticking the simulation
createGameSlice.tick() (in gameSlice.ts) loops all tanks and calls FishService.tickFish(fish, newWaterQuality) for each living fish, collects returned fish objects, and then set({... tanks: newTanks, credits: newCredits, ...}).
So the store orchestrates (where state lives), while services contain the deterministic logic.
Example consumer patterns
React component subscribes to credits: const credits = useGameStore(s => s.credits)
Component dispatches an action: useGameStore(s => s.feedTank) then call feedTank(tankId)
Non-React code (Pixi sprite) sells a fish: useGameStore.getState().sellFish(tankId, fishId) — used in FishSprite click handler.
Selector to get selected fish: selectSelectedFish exported from useGameStore file or useGameStore(s => s.selectedFishId) then find fish.
Recommended mental model

Zustand store = authoritative runtime state for both UI and domain entities (tanks, fish). Treat this as the single source of truth for the running app.
Services/models = pure functions that compute and return new domain entities or calculations (used by slices to mutate state in a controlled way).
Components/UI = subscribe to store pieces (selectors) and call actions. Rendering code (Pixi) also consumes the store directly where needed.
Where things might look duplicated or confusing

You noticed "state already in the business logic": sometimes services create or return new objects (e.g., new Fish objects). That can look like duplicate state, but the important separation is:
Services compute/constrain the domain logic (pure).
The store holds the authoritative instances used across the app (and persisted/serialized if needed).
Avoid having two separate mutable sources of truth. Either:
Use services to return new immutable objects and set them into the store, or
If using mutable models, ensure the store updates are made intentionally (and consider shallow cloning when necessary).
Practical tips when switching from Redux/useReducer or useReducer+Context

Replace reducer + action creators with slice functions:
In Redux you'd do dispatch({type: 'feed', payload}), now with Zustand you call feedTank(tankId) directly.
Use selectors to minimize re-renders:
const fish = useGameStore(state => state.tank?.fish || []) — or export a named selector selectTankFish.
Middleware/devtools:
This repo uses devtools middleware in useGameStore (see the creation). That gives time-travel/inspect-like debugging similar to Redux DevTools.
Tests:
Services remain pure and are easy to unit-test.
For store tests, use the store directly (useGameStore.getState()), set initial conditions, call actions, and assert state changes.
Small code snippets (how you would do things)

Read credits in a React component:
const credits = useGameStore(s => s.credits)
Call an action:
const feedTank = useGameStore(s => s.feedTank); feedTank(tankId)
Read state from non-React code:
const state = useGameStore.getState(); state.sellFish(tankId, fishId)
Avoid subscribing to large objects:
Use specific selectors (e.g., select a fish by id), not the whole tanks array unless you need it.
Where to store what (guidelines)

UI-only ephemeral state: selectedFishId, sellMode, modal visibility → store is OK.
Domain state: tanks, fish, credits, pollution → store is appropriate (the renderer and UI both need this).
Pure calculations and rules: FishService, EconomyService — keep them out of the store and call them from slice actions so logic is testable and reusable.
