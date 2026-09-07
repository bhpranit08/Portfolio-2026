export default function Section({ id, number, label, title, note, children }) {
  return (
    <section id={id} className={`section section-${id}`} aria-labelledby={`${id}-title`} tabIndex={-1}>
      <div className="section-meta"><span>{number} / {label}</span><span>PS—2026 / INDEX {number}</span></div>
      <div className="section-heading" data-reveal>
        <h2 id={`${id}-title`}>{title}</h2>
        <p>{note}</p>
      </div>
      {children || <div className="placeholder-slot"><span>CONTENT PENDING</span><span>[ {number} ]</span></div>}
    </section>
  )
}
