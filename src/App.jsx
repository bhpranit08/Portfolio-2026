import { lazy, Suspense, useRef } from 'react'
import LenisProvider from './components/LenisProvider.jsx'
import Navigation from './components/Navigation.jsx'
import SceneBoundary from './components/SceneBoundary.jsx'
import SceneFallback from './components/SceneFallback.jsx'
import MotionToggle from './components/MotionToggle.jsx'
import { useAnimationState } from './hooks/useAnimationState.js'
import Hero from './sections/Hero.jsx'
import About from './sections/About.jsx'
import Activity from './sections/Activity.jsx'
import Work from './sections/Work.jsx'
import Stack from './sections/Stack.jsx'
import Lab from './sections/Lab.jsx'
import Contact from './sections/Contact.jsx'
import usePageAnimations from './animations/usePageAnimations.js'

const GlobalScene = lazy(() => import('./three/GlobalScene.jsx'))

function Portfolio() {
  const page = useRef()
  const store = useAnimationState()
  usePageAnimations(page)
  return (
    <>
      <a className="skip-link" href="#about">Skip introduction</a>
      <Navigation />
      <MotionToggle />
      <SceneBoundary onFailure={() => store.setSceneStatus('unavailable')} fallback={<SceneFallback failed />}><Suspense fallback={<SceneFallback />}><GlobalScene /></Suspense></SceneBoundary>
      <main ref={page}>
        <Hero />
        <About />
        <Work />
        <Stack />
        <Activity />
        <Lab />
        <Contact />
      </main>
    </>
  )
}

export default function App() {
  return <LenisProvider><Portfolio /></LenisProvider>
}
