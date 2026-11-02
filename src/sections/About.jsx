import { useRef } from 'react'
import { sections } from '../data/sections.js'
import useAboutAnimations from '../animations/useAboutAnimations.js'

export default function About() {
  const root = useRef()
  const { id, number, label, title, fields, bio, personal } = sections.about
  useAboutAnimations(root)
  return <section ref={root} id={id} className="section section-about" aria-labelledby="about-title" tabIndex={-1}>
    <div className="section-meta" data-about-meta><span>{number} / {label}</span><span>THE PERSON BEHIND THE PIXELS</span></div>
    <div className="about-layout">
      <div className="about-statement">
        <p className="about-label" data-about-meta><span aria-hidden="true">↳</span> ALWAYS A WORK IN PROGRESS</p>
        <h2 id="about-title" aria-label={title.replaceAll('\n', ' ')}>{title.split('\n').map((line) => <span className="text-clip" key={line} aria-hidden="true"><span data-about-line>{line}</span></span>)}</h2>
      </div>
      <div className="about-core-label" aria-hidden="true" data-about-meta><span className="about-rule" /><span>MORE THAN THE SUM</span><span>OF ITS PARTS.</span></div>
      <div className="about-bio" data-about-detail><p>{bio}</p><p>{personal}</p></div>
      <div className="about-profile"><dl>{fields.map(([name, value]) => <div className="about-field" key={name}><span className="about-rule" aria-hidden="true" /><dt data-about-detail>{name}</dt><dd data-about-detail>{value}</dd></div>)}</dl></div>
    </div>
  </section>
}
