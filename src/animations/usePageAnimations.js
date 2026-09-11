import { useEffect } from 'react'
import { animate, createScope } from 'animejs'
import useReducedMotion from '../hooks/useReducedMotion.js'

export default function usePageAnimations(root) {
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (reducedMotion) return
    const scope = createScope({ root })
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        scope.execute(() => animate(entry.target, { opacity: [0, 1], y: [24, 0], duration: 650, ease: 'out(3)' }))
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.12 })
    const elements = root.current.querySelectorAll('[data-reveal]')
    elements.forEach((node) => observer.observe(node))
    // Native disclosures provide the behavior; Anime.js only introduces the record.
    const revealRecord = (event) => {
      if (!event.target.open) return
      scope.execute(() => animate(event.target.querySelector('.lab-record-body'), { opacity: [0, 1], y: [8, 0], duration: 280, ease: 'out(3)' }))
    }
    const records = root.current.querySelectorAll('.lab-record')
    records.forEach((record) => record.addEventListener('toggle', revealRecord))
    return () => {
      observer.disconnect()
      records.forEach((record) => record.removeEventListener('toggle', revealRecord))
      scope.revert()
    }
  }, [root, reducedMotion])
}
