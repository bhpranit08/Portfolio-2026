import { useRef } from 'react'
import useHeroAnimations from '../animations/useHeroAnimations.js'

function HeroScrollIndicator() {
  return <div className="hero-enter"><a href="#about">SCROLL TO ENTER <span className="scroll-arrow" aria-hidden="true">↓</span></a></div>
}

export default function Hero() {
  const root = useRef()
  useHeroAnimations(root)
  return (
    <section ref={root} id="hero" className="hero" aria-labelledby="hero-title">
      <header className="hero-header">
        <a className="wordmark" href="#hero" aria-label="PS 2026 home">PS<span>//</span>2026</a>
        <span className="system-status"><i aria-hidden="true" />SYSTEM STATUS: ONLINE</span>
      </header>
      <div className="hero-copy">
        <p className="eyebrow">01 / HERO <span>INDEPENDENT DEVELOPER</span></p>
        <h1 id="hero-title" aria-label="I build digital systems.">
          {['I BUILD', 'DIGITAL', 'SYSTEMS.'].map((line) => <span className="text-clip" key={line} aria-hidden="true"><span data-hero-line>{line}</span></span>)}
        </h1>
        <p className="hero-description">Engineering ideas into things<br />you can use, feel, and explore.</p>
      </div>
      <div className="core-caption" aria-hidden="true"><span>CORE / 001</span><span>INTERACTIVE OBJECT</span><b>+</b></div>
      <footer className="hero-footer">
        <HeroScrollIndicator />
        <span>DEVELOPER PORTFOLIO — V.2026</span>
      </footer>
    </section>
  )
}
