import ContributionGraph from '../components/ContributionGraph.jsx'
import { sections } from '../data/sections.js'
import { contributionYear, contributions } from '../data/contributions.js'

export default function Activity() {
  const { id, number, label, title, note } = sections.activity
  return (
    <section id={id} className="section section-activity" aria-labelledby="activity-title" tabIndex={-1} data-section-progress="0">
      <div className="section-meta" data-activity-meta><span>{number} / {label}</span><span>PS—2026 / INDEX {number}</span></div>
      <div className="activity-heading">
        <h2 id="activity-title"><span className="text-clip"><span data-activity-title>{title}</span></span></h2>
        <p data-activity-meta>{note}</p>
      </div>
      <ContributionGraph year={contributionYear} contributions={contributions} />
    </section>
  )
}
