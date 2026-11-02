import { useEffect, useRef, useState } from 'react'
import Section from '../components/Section.jsx'
import { sections } from '../data/sections.js'
import { projects } from '../data/projects.js'
import { useAnimationState } from '../hooks/useAnimationState.js'

function ProjectVisual({ project }) {
  return <figure className="project-visual" style={{ '--project-accent': project.accent }}>
    <div className="visual-header"><span>PB / SELECTED WORK</span><span>{project.number} — 05</span></div>
    <div className="visual-image"><img src={project.image} alt={project.imageAlt} loading="lazy" width="1200" height="800" onError={(event) => { event.currentTarget.hidden = true }} /><span className="visual-fallback" aria-hidden="true">{project.title}<small>{project.category}</small></span></div>
    <figcaption><span>{project.imageLabel}</span><span aria-hidden="true">↗</span></figcaption>
  </figure>
}

export default function Work() {
  const root = useRef()
  const store = useAnimationState()
  const [active, setActive] = useState('01')
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
      if (!visible.length) return
      const number = visible.at(-1).target.dataset.project
      setActive(number)
      store.setActiveProject(number)
    }, { rootMargin: '-25% 0px -40% 0px' })
    root.current.querySelectorAll('[data-project]').forEach((article) => observer.observe(article))
    return () => observer.disconnect()
  }, [store])
  const activate = (number) => { setActive(number); store.setActiveProject(number) }
  return <Section {...sections.work}>
    <div className="index-caption" data-reveal><span>IDEA → ITERATION → SOMETHING REAL</span><span>01—05 / EXPLORE THE WORK</span></div>
    <div ref={root} className="work-layout">
      <div className="work-gallery" aria-hidden="true"><div className="work-gallery-frame">{projects.map((project) => <div className="gallery-slide" key={project.number} data-active={active === project.number}><ProjectVisual project={project} /></div>)}</div><div className="gallery-progress" aria-hidden="true">{projects.map((project) => <span key={project.number} data-active={active === project.number} />)}<span>{active} / 05</span></div></div>
      <ol className="project-index">{projects.map((project) => <li className="project-chapter" data-project={project.number} key={project.number} style={{ '--project-accent': project.accent }} onFocusCapture={() => activate(project.number)}>
        <div className="project-mobile-visual"><ProjectVisual project={project} /></div>
        <div className="project-content" data-reveal>
          <div className="project-meta"><span>{project.number} / {project.status}</span><span>{project.year}</span></div>
          <p className="project-category">{project.category}</p>
          <h3>{project.title}</h3>
          <p className="project-description">{project.description}</p>
          <ul className="project-details">{project.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
          <ul className="project-tech" aria-label={`${project.title} technologies`}>{project.technologies.map((technology) => <li key={technology}>{technology}</li>)}</ul>
          <div className="project-links">{project.url && <a className="text-link" href={project.url} aria-label={`Visit ${project.title}`}>VISIT WEBSITE <span aria-hidden="true">↗</span></a>}{project.repositoryUrl && <a className="text-link" href={project.repositoryUrl} aria-label={`View ${project.title} source code`}>EXPLORE THE CODE <span aria-hidden="true">↗</span></a>}</div>
        </div>
      </li>)}</ol>
    </div>
    <p className="index-footnote" data-reveal>FIVE DIFFERENT WHAT-IFS. <span>ONE CURIOUS MIND.</span></p>
  </Section>
}
