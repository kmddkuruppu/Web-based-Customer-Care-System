export default function PageHero({ eyebrow, title, subtitle, action }) {
  return (
    <section className="hero">
      <div className="hero-text">
        {eyebrow && <span className="hero-eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="hero-action">{action}</div>}
    </section>
  );
}
