import Section from '../components/Section.jsx'
import { sections } from '../data/sections.js'
import { stack } from '../data/stack.js'

export default function Stack() {
  return (
    <Section {...sections.stack}>
      <div className="stack-layout">
        <div className="stack-caption" data-reveal><span className="technical-label">CORE / 001</span><span className="technical-label">NO RATINGS. JUST TOOLS.</span></div>
        <ol className="stack-index">
          {stack.map(({ name, category }, index) => <li key={name} data-reveal><span className="index-number">{String(index + 1).padStart(2, '0')}</span><h3>{name}</h3><span className="technical-label">{category}</span></li>)}
        </ol>
      </div>
    </Section>
  )
}
