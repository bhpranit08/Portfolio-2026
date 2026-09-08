import { useRef } from 'react'
import { sections } from '../data/sections.js'
import useAboutAnimations from '../animations/useAboutAnimations.js'

export default function About() {
  const root = useRef()
  const { id, number, label, title, fields } = sections.about
  useAboutAnimations(root)

  return (
    <section ref={root} id={id} className="section section-about" aria-labelledby="about-title" tabIndex={-1} data-section-progress="0">
      <div className="section-meta" data-about-meta><span>{number} / {label}</span><span>PS—2026 / INDEX {number}</span></div>
      <div className="about-layout">
        <div className="about-statement">
          <p className="about-label" data-about-meta><span aria-hidden="true">↳</span> STATEMENT / PLACEHOLDER</p>
          <h2 id="about-title" aria-label={title.replaceAll('\n', ' ')}>
            {title.split('\n').map((line) => (
              <span className="text-clip" key={line} aria-hidden="true"><span data-about-line>{line}</span></span>
            ))}
          </h2>
        </div>
        <div className="about-core-label" aria-hidden="true" data-about-meta>
          <span className="about-rule" />
          <span>CORE / 001</span><span>HUMAN INPUT.</span>
        </div>
        <div className="about-profile">
          <p className="about-label" data-about-detail>PROFILE / PLACEHOLDER VALUES</p>
          <dl>
            {fields.map(([name, value]) => (
              <div className="about-field" key={name}>
                <span className="about-rule" aria-hidden="true" />
                <dt data-about-detail>{name}</dt>
                <dd data-about-detail>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
