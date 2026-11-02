import { useSyncExternalStore } from 'react'
import Section from '../components/Section.jsx'
import { sections } from '../data/sections.js'
import { labModes } from '../data/lab.js'
import { useAnimationState } from '../hooks/useAnimationState.js'
import useReducedMotion from '../hooks/useReducedMotion.js'

export default function Lab() {
  const store = useAnimationState()
  const mode = useSyncExternalStore(store.subscribe, () => store.state.labMode)
  const status = useSyncExternalStore(store.subscribe, () => store.state.sceneStatus)
  const reduced = useReducedMotion()
  return <Section {...sections.lab}>
    <div className="lab-layout">
      <div className="lab-viewport" aria-hidden="true"><span className="lab-reticle">+</span><span>REACTOR / 001<br />{status === 'ready' ? 'AWAITING YOUR INPUT' : 'STATIC PREVIEW'}</span></div>
      <div className="lab-controls" data-reveal>
        <p className="technical-label">CHANGE THE STATE. SEE WHAT HAPPENS.</p>
        <div className="lab-mode-list" role="group" aria-label="Reactor mode">{labModes.map((item) => <button key={item.id} type="button" className="lab-mode" aria-pressed={mode === item.id} disabled={status !== 'ready'} onClick={() => store.setLabMode(item.id)}><span>{item.number}</span><span>{item.title}</span><span aria-hidden="true">{mode === item.id ? '↗' : '+'}</span></button>)}</div>
        <p className="lab-description" role="status">{status === 'ready' ? labModes.find(({ id }) => id === mode).description : status === 'loading' ? 'The interactive reactor is loading.' : 'The 3D scene is unavailable in this browser. You can still explore every project and the static reactor illustration.'}</p>
        {reduced && status === 'ready' && <p className="technical-label lab-motion-note">MOTION IS OFF / STATES CHANGE INSTANTLY</p>}
      </div>
    </div>
  </Section>
}
