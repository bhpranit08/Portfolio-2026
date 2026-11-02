import { useLayoutEffect, useRef, useState } from 'react'
import { animate, createScope, stagger } from 'animejs'
import { navigation } from '../data/sections.js'
import { useAnimationState } from '../hooks/useAnimationState.js'
import useReducedMotion from '../hooks/useReducedMotion.js'

export default function Navigation() {
  const [open, setOpen] = useState(false)
  const dialog = useRef()
  const scope = useRef()
  const destination = useRef(null)
  const closing = useRef(false)
  const store = useAnimationState()
  const reducedMotion = useReducedMotion()

  useLayoutEffect(() => {
    if (!open) return
    const panel = dialog.current
    closing.current = false
    panel.showModal() // Native focus trapping, inert background, and focus restoration.
    store.setOverlayOpen(true)
    store.state.lenis?.stop()
    scope.current = createScope({ root: panel })
    if (!reducedMotion) scope.current.add(() => {
      animate(panel, { opacity: [0, 1], duration: 240 })
      animate('.navigation-link', { y: [18, 0], opacity: [0, 1], delay: stagger(35), duration: 380, ease: 'out(3)' })
    })
    return () => {
      scope.current.revert()
      panel.close()
      store.setOverlayOpen(false)
      store.state.lenis?.start()
      if (destination.current) {
        const target = document.getElementById(destination.current)
        destination.current = null
        store.state.lenis?.scrollTo(target, { immediate: reducedMotion, onComplete: () => target?.focus({ preventScroll: true }) })
      }
    }
  }, [open, reducedMotion, store])

  const close = (id = null) => {
    if (closing.current) return
    closing.current = true
    destination.current = id
    if (reducedMotion) setOpen(false)
    else scope.current.execute(() => animate(dialog.current, { opacity: 0, duration: 180, onComplete: () => setOpen(false) }))
  }

  return (
    <>
      <button className="menu-toggle" type="button" aria-haspopup="dialog" aria-controls="system-navigation" aria-expanded={open} onClick={() => setOpen(true)}>MENU <span aria-hidden="true">+</span></button>
      <dialog ref={dialog} id="system-navigation" className="navigation-overlay" aria-labelledby="navigation-title" onCancel={(event) => { event.preventDefault(); close() }} data-lenis-prevent>
        <div className="navigation-header"><span className="wordmark">PB<span>*</span></span><button type="button" className="menu-close" onClick={() => close()} autoFocus>CLOSE <span aria-hidden="true">×</span></button></div>
        <div className="navigation-layout">
          <div className="navigation-caption"><h2 id="navigation-title" className="technical-label">CHAPTER INDEX</h2><p>FIND YOUR<br />WAY THROUGH.</p><span className="technical-label">PRANIT BHANDARI / SEVEN CHAPTERS</span></div>
          <nav aria-label="Main navigation">{navigation.map(({ id, number, label }) => <a className="navigation-link" key={id} href={`#${id}`} onClick={(event) => { event.preventDefault(); close(id) }}><span>{number} /</span>{label}<span aria-hidden="true">↗</span></a>)}</nav>
        </div>
        <p className="navigation-footer technical-label">DEVELOPER PORTFOLIO — V.2026 <span>ESC / CLOSE</span></p>
      </dialog>
    </>
  )
}
