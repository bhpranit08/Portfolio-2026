import Section from '../components/Section.jsx'
import { sections } from '../data/sections.js'
import { contact } from '../data/contact.js'

export default function Contact() {
  return <Section {...sections.contact}>
    <div className="contact-action" data-reveal>
      <a className="project-cta" href={contact.destination}><span>SAY HELLO</span><span aria-hidden="true">↗</span></a>
      <a className="contact-email" href={contact.destination}>{contact.email}</a>
      <div className="contact-socials"><a className="text-link" href={contact.github}>GITHUB ↗</a><a className="text-link" href={contact.linkedin}>LINKEDIN ↗</a></div>
    </div>
    <footer className="contact-footer" data-reveal>
      <div><a className="wordmark" href="#hero" aria-label="Pranit Bhandari, return to the beginning">PB<span>*</span></a><p>BUILT WITH CURIOSITY IN KATHMANDU.</p></div>
      <p>PRANIT BHANDARI © 2026<br />THERE’S ALWAYS A NEXT ITERATION.</p>
      <a className="back-top" href="#hero">BACK TO THE BEGINNING <span aria-hidden="true">↑</span></a>
    </footer>
  </Section>
}
