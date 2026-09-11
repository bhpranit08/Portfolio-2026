import Section from '../components/Section.jsx'
import { sections } from '../data/sections.js'
import { contact } from '../data/contact.js'

export default function Contact() {
  return (
    <Section {...sections.contact}>
      <div className="contact-action" data-reveal>
        {contact.destination ? <a className="project-cta" href={contact.destination}>START A PROJECT <span aria-hidden="true">↗</span></a> : (
          <details className="contact-pending"><summary className="project-cta">START A PROJECT <span aria-hidden="true">↗</span></summary><p>{contact.pending}</p></details>
        )}
        <a className="text-link" href={contact.github}>GITHUB / @BHPRANIT08 ↗</a>
      </div>
      <footer className="contact-footer" data-reveal>
        <div className="completion-status"><span>SYSTEM: <b>COMPLETE</b></span><span>CONNECTION: READY</span></div>
        <a className="wordmark" href="#hero" aria-label="Return to the start">PS<span>//</span>2026 <span className="return-arrow" aria-hidden="true">↑</span></a>
        <p>DEVELOPER PORTFOLIO — V.2026</p>
        <p className="asset-credit">CORE: <a href="https://sketchfab.com/3d-models/sci-fi-energy-core-1-a5aefe7b281f46529aed2ec9d873bc52">FilipZelinka</a> / <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a> / material adapted</p>
      </footer>
    </Section>
  )
}
