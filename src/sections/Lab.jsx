import Section from '../components/Section.jsx'
import { sections } from '../data/sections.js'
import { experiments } from '../data/lab.js'

export default function Lab() {
  return (
    <Section {...sections.lab}>
      <div className="lab-layout">
        <div className="lab-caption" data-reveal><span className="technical-label">CONTROLLED UNCERTAINTY</span><span className="technical-label">OPEN A RECORD TO INSPECT ↓</span></div>
        <div className="lab-index">
          {experiments.map((experiment) => (
            <details className="lab-record" key={experiment.number} data-reveal>
              <summary><span className="index-number">{experiment.number}</span><h3>{experiment.category}</h3><span className="lab-toggle" aria-hidden="true">+</span></summary>
              <div className="lab-record-body"><span className="technical-label">{experiment.status}</span><h4>{experiment.title}</h4><p>{experiment.description}</p>{experiment.url && <a className="text-link" href={experiment.url}>OPEN EXPERIMENT ↗</a>}</div>
            </details>
          ))}
        </div>
      </div>
    </Section>
  )
}
