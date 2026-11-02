import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { AnimationContext } from '../hooks/useAnimationState.js'
import { createAnimationState } from '../hooks/animation-state.js'
import { coreStates } from '../three/core-timeline.js'

export default function LenisProvider({ children }) {
  const [store] = useState(createAnimationState)

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: false, lerp: 0.085, respectReducedMotion: true })
    store.setLenis(lenis)
    const syncScroll = () => store.updateScroll(lenis)
    const unsubscribe = lenis.on('scroll', syncScroll)
    syncScroll()
    const sections = coreStates.map(({ id }) => document.getElementById(id)).filter(Boolean)
    const measure = () => {
      lenis.resize()
      syncScroll()
      const lab = document.querySelector('.lab-viewport')?.getBoundingClientRect()
      store.state.labAnchor = lab ? { top: lab.top + lenis.actualScroll, left: lab.left, width: lab.width, height: lab.height } : null
      store.setSections(sections.map((section) => ({
        id: section.id, top: section.getBoundingClientRect().top + lenis.actualScroll,
      })), window.innerHeight, lenis.limit)
    }
    const resize = new ResizeObserver(measure)
    sections.forEach((section) => resize.observe(section))
    resize.observe(document.documentElement)
    window.addEventListener('resize', measure)
    measure()
    const pointer = (event) => {
      if (event.pointerType === 'touch') return
      store.updatePointer(event.clientX / window.innerWidth * 2 - 1, 1 - event.clientY / window.innerHeight * 2, performance.now())
    }
    const resetPointer = () => store.updatePointer(0, 0, performance.now())
    const navigate = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const link = event.target.closest('a[href^="#"]')
      const target = link && document.getElementById(link.getAttribute('href').slice(1))
      if (!target || link.target || link.hasAttribute('download')) return
      event.preventDefault()
      lenis.scrollTo(target, { immediate: !store.state.motionEnabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches, onComplete: () => {
        window.history.pushState(null, '', link.getAttribute('href'))
        target.focus({ preventScroll: true })
      } })
    }
    const releaseKeyboardScroll = (event) => {
      if (event.defaultPrevented || event.target.closest('input, textarea, select, [contenteditable="true"]')) return
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) lenis.reset()
    }
    window.addEventListener('pointermove', pointer, { passive: true })
    window.addEventListener('click', navigate)
    window.addEventListener('keydown', releaseKeyboardScroll)
    window.addEventListener('blur', resetPointer)
    document.documentElement.addEventListener('pointerleave', resetPointer)
    let frame
    let previous
    const tick = (time) => {
      lenis.options.smoothWheel = store.state.motionEnabled && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
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
      resize.disconnect()
      window.removeEventListener('resize', measure)
      lenis.destroy()
      store.setLenis(null)
      window.removeEventListener('pointermove', pointer)
      window.removeEventListener('click', navigate)
      window.removeEventListener('keydown', releaseKeyboardScroll)
      window.removeEventListener('blur', resetPointer)
      document.documentElement.removeEventListener('pointerleave', resetPointer)
    }
  }, [store])

  return <AnimationContext value={store}>{children}</AnimationContext>
}
