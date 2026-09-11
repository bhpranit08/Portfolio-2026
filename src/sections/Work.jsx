import Section from '../components/Section.jsx'
import { sections } from '../data/sections.js'
import { projects } from '../data/projects.js'

export default function Work() {
  return (
    <Section {...sections.work}>
      <div className="index-caption" data-reveal><span>PROJECT INDEX</span><span>{String(projects.length).padStart(2, '0')} RECORDS / EDITABLE</span></div>
      <ol className="project-index">
        {projects.map((project) => (
          <li key={project.number} className="project-row" data-reveal>
            <span className="index-number">{project.number}</span>
            <div className="project-content">
              <h3>{project.url ? <a href={project.url}>{project.title}<span className="project-arrow" aria-hidden="true">↗</span></a> : project.title}</h3>
              <p>{project.description}</p>
              <ul className="project-tech" aria-label="Technologies">{project.technologies?.map((technology) => <li key={technology}>{technology}</li>)}</ul>
              {project.image && <img className="project-image" src={project.image} alt={`${project.title} preview`} loading="lazy" onError={(event) => { event.currentTarget.hidden = true }} />}
              {project.caseStudy && <a className="text-link" href={project.caseStudy}>READ CASE STUDY ↗</a>}
            </div>
            <p className="project-status">{project.year}<span>{project.status}</span></p>
          </li>
        ))}
      </ol>
      <p className="index-footnote" data-reveal>END OF INDEX <span aria-hidden="true">↳</span> NEXT / THE TOOLSET</p>
    </Section>
  )
}
