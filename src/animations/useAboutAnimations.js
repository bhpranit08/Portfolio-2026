import { useLayoutEffect } from 'react'
import { createScope, createTimeline, stagger, utils } from 'animejs'
import { useAnimationState } from '../hooks/useAnimationState.js'
import useReducedMotion from '../hooks/useReducedMotion.js'

export default function useAboutAnimations(root) {
  const store = useAnimationState()
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    const element = root.current
    let previousProgress
    // Reuse the same normalized About progress consumed by the global CORE.
    const unsubscribe = store.subscribe(({ timeline }) => {
      const progress = (timeline.stops.find(({ id }) => id === 'about')?.progress ?? 0).toFixed(4)
      if (progress === previousProgress) return
      previousProgress = progress
      element.dataset.sectionProgress = progress
    })
    const scope = createScope({ root })
    let observer
    if (!reducedMotion) scope.add(() => {
      utils.set('[data-about-meta], [data-about-detail]', { opacity: 0 })
      utils.set('[data-about-line]', { y: '105%' })
      utils.set('.about-rule', { scaleX: 0 })
      const reveal = createTimeline({ autoplay: false, defaults: { ease: 'out(3)' } })
        .add('[data-about-meta]', { opacity: [0, 1], y: [5, 0], duration: 360 }, 0)
        .add('.about-core-label .about-rule', { scaleX: [0, 1], duration: 600 }, 100)
        .add('[data-about-line]', { y: ['105%', '0%'], duration: 640, delay: stagger(110) }, 180)
        .add('[data-about-detail]', { opacity: [0, 1], y: [8, 0], duration: 420, delay: stagger(35) }, 850)
        .add('.about-profile .about-rule', { scaleX: [0, 1], duration: 520, delay: stagger(60) }, 800)
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        reveal.play()
        observer.disconnect()
      }, { rootMargin: '0px 0px -12% 0px' })
      observer.observe(element)
    })
    return () => {
      unsubscribe()
      observer?.disconnect()
      scope.revert()
      element.removeAttribute('data-section-progress')
    }
  }, [root, store, reducedMotion])
}
