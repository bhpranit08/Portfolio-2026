import { useRef } from 'react'
import useHeroAnimations from '../animations/useHeroAnimations.js'

export default function Hero() {
  const root = useRef()
  useHeroAnimations(root)
  return <section ref={root} id="hero" className="hero" aria-labelledby="hero-title" tabIndex={-1}>
    <header className="hero-header">
      <a className="wordmark" href="#hero" aria-label="Pranit Bhandari home">PB<span>*</span><small>INDEPENDENT MIND.<br />ENDLESS CURIOSITY.</small></a>
      <span className="system-status"><i aria-hidden="true" />KATHMANDU, NP <span>27.7° N / 85.3° E</span></span>
    </header>
    <div className="hero-copy">
      <p className="eyebrow">PRANIT BHANDARI <span>FULL-STACK DEVELOPER</span></p>
      <h1 id="hero-title" aria-label="Ideas into reality.">{['IDEAS.', 'INTO', 'REALITY.'].map((line) => <span className="text-clip" key={line} aria-hidden="true"><span data-hero-line>{line}</span></span>)}</h1>
      <p className="hero-description">A curious mind. A builder’s instinct.<br />Turning what-ifs into things that work.</p>
    </div>
    <div className="hero-orbit-mark" aria-hidden="true"><span>01</span><i /><i /><i /><i /></div>
    <div className="core-caption" aria-hidden="true"><span><i /> REACTOR / 001</span><span>AN EXERCISE IN CURIOSITY</span><span>MOVE TO EXPLORE ↗</span></div>
    <footer className="hero-footer">
      <div className="hero-enter"><a href="#about"><span className="scroll-arrow" aria-hidden="true">↓</span>SCROLL TO DISCOVER</a></div>
      <span>CODE. BREAK. LEARN. REPEAT.</span>
      <span>PERSONAL PORTFOLIO / 2026</span>
    </footer>
  </section>
}
