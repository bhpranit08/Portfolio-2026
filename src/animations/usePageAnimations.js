import { useEffect } from 'react'
import { animate, createScope, stagger } from 'animejs'
import useReducedMotion from '../hooks/useReducedMotion.js'

export default function usePageAnimations(root) {
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (reducedMotion) return
    const scope = createScope({ root })
    scope.add(() => {
      animate('[data-hero-line]', { y: ['105%', '0%'], duration: 850, delay: stagger(100), ease: 'out(4)' })
    })
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        scope.execute(() => animate(entry.target, { opacity: [0, 1], y: [24, 0], duration: 650, ease: 'out(3)' }))
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.12 })
    root.current.querySelectorAll('[data-reveal]').forEach((node) => observer.observe(node))
    return () => {
      observer.disconnect()
      scope.revert()
    }
  }, [root, reducedMotion])
}
