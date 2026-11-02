import { useEffect } from 'react'
import { useAnimationState } from '../hooks/useAnimationState.js'
import useReducedMotion from '../hooks/useReducedMotion.js'

export default function MotionToggle() {
  const store = useAnimationState()
  const reduced = useReducedMotion()
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'off' : 'on'
    return () => { delete document.documentElement.dataset.motion }
  }, [reduced])
  const systemReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return <button className="motion-toggle" type="button" aria-label="Reduce motion" aria-pressed={reduced} disabled={systemReduced} title={systemReduced ? 'Reduced motion follows your system preference' : 'Turn decorative motion on or off'} onClick={() => store.setMotionEnabled(!store.state.motionEnabled)}><span className="motion-symbol" aria-hidden="true">{reduced ? 'Ⅱ' : '≈'}</span><span>MOTION <b>{reduced ? 'OFF' : 'ON'}</b></span></button>
}
