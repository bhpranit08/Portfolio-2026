import { useLayoutEffect } from 'react'
import { createScope, createTimeline, stagger, utils } from 'animejs'
import { useAnimationState } from '../hooks/useAnimationState.js'
import useReducedMotion from '../hooks/useReducedMotion.js'

export default function useContributionAnimations(root, total) {
  const store = useAnimationState()
  const reducedMotion = useReducedMotion()
  useLayoutEffect(() => {
    const graph = root.current
    const section = graph.closest('section') ?? graph
    let previousProgress
    const unsubscribe = store.subscribe(({ timeline }) => {
      const progress = (timeline.stops.find(({ id }) => id === section.id)?.progress ?? 0).toFixed(4)
      if (progress === previousProgress) return
      previousProgress = progress
      section.dataset.sectionProgress = progress
    })
    const scope = createScope({ root: section })
    let observer
    let finish
    if (!reducedMotion) scope.add(() => {
      const count = graph.querySelector('[data-contribution-count]')
      const counter = { value: 0 }
      utils.set('[data-activity-meta], .graph-heading, .graph-month, .graph-day, .graph-legend, .graph-hint', { opacity: 0 })
      utils.set('[data-activity-title]', { y: '105%' })
      utils.set('[data-contribution-cell]', { opacity: 0, scale: 0.8 })
      utils.set('.graph-rule', { scaleX: 0 })
      count.textContent = '0'
      const heading = createTimeline({ autoplay: false, defaults: { ease: 'out(3)' } })
        .add('[data-activity-meta]', { opacity: [0, 1], duration: 320 }, 0)
        .add('[data-activity-title]', { y: ['105%', '0%'], duration: 640 }, 160)
      const reveal = createTimeline({ autoplay: false, defaults: { ease: 'out(3)' } })
        .add('.graph-rule', { scaleX: [0, 1], duration: 500 }, 650)
        .add('.graph-heading, .graph-month, .graph-day', { opacity: [0, 1], duration: 350 }, 750)
        .add('[data-contribution-cell]', { opacity: [0, 1], scale: [0.8, 1], duration: 300, delay: stagger(2) }, 950)
        .add(counter, { value: total, duration: 1000, onUpdate: () => { count.textContent = Math.round(counter.value).toLocaleString('en-US') } }, 1200)
        .add('.graph-legend, .graph-hint', { opacity: [0, 1], duration: 350 }, 2200)
      finish = () => { heading.seek(heading.duration); reveal.seek(reveal.duration) }
      // Labels can enter before the graph; cells wait until the graph itself is visible.
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (entry.target === section) heading.play()
          if (entry.target === graph) reveal.play()
          observer.unobserve(entry.target)
        }
      }, { threshold: 0.15 })
      observer.observe(section)
      observer.observe(graph)
      graph.addEventListener('focusin', finish)
    })
    return () => {
      unsubscribe()
      observer?.disconnect()
      if (finish) graph.removeEventListener('focusin', finish)
      scope.revert()
      graph.querySelector('[data-contribution-count]').textContent = total.toLocaleString('en-US')
      section.removeAttribute('data-section-progress')
    }
  }, [root, store, reducedMotion, total])
}
