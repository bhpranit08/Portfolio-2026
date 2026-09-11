import ContributionGraph from '../components/ContributionGraph.jsx'
import { sections } from '../data/sections.js'
import useGithubContributions from '../hooks/useGithubContributions.js'

export default function Activity() {
  const { id, number, label, title, note } = sections.activity
  const activity = useGithubContributions()
  return (
    <section id={id} className="section section-activity" aria-labelledby="activity-title" tabIndex={-1} data-section-progress="0">
      <div className="section-meta" data-activity-meta><span>{number} / {label}</span><span>PS—2026 / INDEX {number}</span></div>
      <div className="activity-heading">
        <h2 id="activity-title"><span className="text-clip"><span data-activity-title>{title}</span></span></h2>
        <p data-activity-meta>{note}</p>
      </div>
      <p className="graph-hint" role="status">
        {activity.status === 'loading' ? 'ACTIVITY / LOADING...' : activity.status === 'live' ? 'LIVE CONTRIBUTION DATA / @bhpranit08' : 'ACTIVITY DATA UNAVAILABLE / LOCAL SAMPLE / FALLBACK'}
      </p>
      {activity.status !== 'loading' && <ContributionGraph {...activity} />}
    </section>
  )
}
