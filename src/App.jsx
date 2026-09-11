import { lazy, Suspense, useRef } from 'react'
import LenisProvider from './components/LenisProvider.jsx'
import Navigation from './components/Navigation.jsx'
import SceneBoundary from './components/SceneBoundary.jsx'
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
  usePageAnimations(page)
  return (
    <>
      <a className="skip-link" href="#about">Skip introduction</a>
      <Navigation />
      <SceneBoundary><Suspense fallback={<div className="global-scene"><p className="scene-status" role="status">INITIALIZING CORE…</p></div>}><GlobalScene /></Suspense></SceneBoundary>
      <main ref={page}>
        <Hero />
        <About />
        <Activity />
        <Work />
        <Stack />
        <Lab />
        <Contact />
      </main>
    </>
  )
}

export default function App() {
  return <LenisProvider><Portfolio /></LenisProvider>
}
