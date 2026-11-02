import { useEffect } from 'react'
import { useAnimationState } from '../hooks/useAnimationState.js'

export default function SceneFallback({ failed = false }) {
  const store = useAnimationState()
  useEffect(() => { if (failed) store.setSceneStatus('unavailable') }, [store, failed])
  return <div className="scene-fallback">
    <svg className="reactor-poster" viewBox="0 0 600 600" fill="none" aria-hidden="true"><defs><radialGradient id="poster-glow"><stop stopColor="#a875ff" stopOpacity=".2"/><stop offset="1" stopColor="#a875ff" stopOpacity="0"/></radialGradient></defs><circle cx="300" cy="300" r="290" fill="url(#poster-glow)"/><g stroke="#647084" strokeWidth="8"><ellipse cx="300" cy="300" rx="240" ry="100" transform="rotate(-35 300 300)"/><ellipse cx="300" cy="300" rx="210" ry="115" transform="rotate(55 300 300)"/><ellipse cx="300" cy="300" rx="180" ry="90" transform="rotate(10 300 300)"/></g><g stroke="#ae85fb" strokeWidth="2"><ellipse cx="300" cy="300" rx="232" ry="92" transform="rotate(-35 300 300)"/><ellipse cx="300" cy="300" rx="202" ry="107" transform="rotate(55 300 300)"/><ellipse cx="300" cy="300" rx="172" ry="82" transform="rotate(10 300 300)"/><path d="m300 240 52 32v60l-52 30-52-30v-60zM248 272l104 60m0-60-104 60m52-92v122"/></g></svg>
    <p className="scene-status" role="status">{failed ? 'STATIC REACTOR / 3D UNAVAILABLE' : 'ASSEMBLING THE REACTOR…'}</p>
  </div>
}
