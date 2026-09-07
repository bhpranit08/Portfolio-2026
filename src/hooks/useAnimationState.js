import { createContext, useContext, useEffect } from 'react'

export const AnimationContext = createContext(null)

export function useAnimationState() {
  const store = useContext(AnimationContext)
  if (!store) throw new Error('Animation state requires LenisProvider')
  return store
}

// For imperative DOM animation; R3F reads store.state inside useFrame instead.
export function useAnimationFrame(callback) {
  const store = useAnimationState()
  useEffect(() => store.subscribe(callback), [store, callback])
}
