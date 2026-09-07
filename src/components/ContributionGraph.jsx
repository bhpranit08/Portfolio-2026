import { useMemo } from 'react'
import { buildContributionCalendar } from '../data/contributions.js'

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ContributionGraph({ year, contributions }) {
  const { cells, months, weeks, total } = useMemo(() => buildContributionCalendar(year, contributions), [year, contributions])
  return (
    <figure className="contribution-panel" data-reveal>
      <figcaption className="graph-heading"><span>CONTRIBUTION LOG / {year}</span><span className="sample-badge">PLACEHOLDER DATA</span></figcaption>
      <div className="graph-scroll" tabIndex={0} role="region" aria-label={`${year} daily contributions; scroll horizontally on small screens`}>
        <table className="contribution-grid" aria-label={`${total.toLocaleString('en-US')} sample contributions in ${year}`}>
          <thead><tr><td />{months.map((month, index) => <th key={month.label} scope="colgroup" colSpan={(months[index + 1]?.column ?? weeks) - month.column}>{month.label}</th>)}</tr></thead>
          <tbody>{days.map((day, row) => (
            <tr key={day}><th scope="row">{day}</th>{Array.from({ length: weeks }, (_, week) => {
              const cell = cells[week * 7 + row]
              const label = cell ? `${cell.date}: ${cell.count} contributions` : 'Outside this year'
              return <td key={week} aria-label={label}><span className={`contribution-cell ${cell ? `level-${cell.level}` : 'empty-cell'}`} title={label} /></td>
            })}</tr>
          ))}</tbody>
        </table>
      </div>
      <div className="graph-footer"><p><strong>{total.toLocaleString('en-US')}</strong> sample contributions in {year}</p><div className="graph-legend" aria-label="Activity intensity from less to more"><span>LESS</span>{[0, 1, 2, 3, 4].map((level) => <span key={level} className={`contribution-cell level-${level}`} aria-hidden="true" />)}<span>MORE</span></div></div>
    </figure>
  )
}
