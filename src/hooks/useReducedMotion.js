import { useContext, useSyncExternalStore } from 'react'
import { AnimationContext } from './useAnimationState.js'

const query = '(prefers-reduced-motion: reduce)'
function subscribe(callback) {
  const media = window.matchMedia(query)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}
const getSnapshot = () => window.matchMedia(query).matches
const noop = () => () => {}
export default function useReducedMotion() {
  const store = useContext(AnimationContext)
  const systemReduced = useSyncExternalStore(subscribe, getSnapshot, () => true)
  const disabled = useSyncExternalStore(store?.subscribe ?? noop, () => store ? !store.state.motionEnabled : false, () => false)
  return systemReduced || disabled
}
