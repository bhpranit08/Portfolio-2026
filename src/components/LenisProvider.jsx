import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { AnimationContext } from '../hooks/useAnimationState.js'
import { createAnimationState } from '../hooks/animation-state.js'

export default function LenisProvider({ children }) {
  const [store] = useState(createAnimationState)

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.085, respectReducedMotion: true })
    const syncScroll = () => store.updateScroll(lenis)
    const unsubscribe = lenis.on('scroll', syncScroll)
    syncScroll()
    const pointer = (event) => {
      if (event.pointerType === 'touch') return
      store.updatePointer(event.clientX / window.innerWidth * 2 - 1, 1 - event.clientY / window.innerHeight * 2, performance.now())
    }
    const resetPointer = () => store.updatePointer(0, 0, performance.now())
    const releaseKeyboardScroll = (event) => {
      if (event.defaultPrevented || event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) lenis.reset()
    }
    window.addEventListener('pointermove', pointer, { passive: true })
    window.addEventListener('keydown', releaseKeyboardScroll)
    window.addEventListener('blur', resetPointer)
    document.documentElement.addEventListener('pointerleave', resetPointer)
    let frame
    let previous
    const tick = (time) => {
      lenis.raf(time)
      syncScroll()
      store.tick(previous === undefined ? 0 : (time - previous) / 1000)
      previous = time
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      unsubscribe()
      lenis.destroy()
      window.removeEventListener('pointermove', pointer)
      window.removeEventListener('keydown', releaseKeyboardScroll)
      window.removeEventListener('blur', resetPointer)
      document.documentElement.removeEventListener('pointerleave', resetPointer)
    }
  }, [store])

  return <AnimationContext value={store}>{children}</AnimationContext>
}
