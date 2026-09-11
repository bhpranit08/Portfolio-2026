export default function Section({ id, number, label, title, note, children }) {
  return (
    <section id={id} className={`section section-${id}`} aria-labelledby={`${id}-title`} tabIndex={-1}>
      <div className="section-meta" data-reveal><span>{number} / {label}</span><span>PS—2026 / INDEX {number}</span></div>
      <div className="section-heading" data-reveal>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{note}</p>
      </div>
      {children}
    </section>
  )
}
