import Icon from './Icon';

export default function AuthLayout({ title, subtitle, children, wide = false }) {
  return (
    <div className="auth-shell">
      <aside className="auth-hero">
        <span className="hero-orb orb-1" />
        <span className="hero-orb orb-2" />
        <span className="hero-orb orb-3" />

        <div className="auth-brand">
          <span className="brand-logo"><Icon name="headphones" size={22} /></span>
          CareDesk
        </div>

        <div className="auth-hero-body">
          <h1>
            Complaints resolved,
            <span> customers delighted.</span>
          </h1>
          <p>
            Submit, track and resolve every customer complaint from the first
            contact to final closure, all in one place.
          </p>
          <ul className="feature-list">
            <li><span><Icon name="zap" size={18} /></span>Instant tickets with unique Ticket IDs</li>
            <li><span><Icon name="activity" size={18} /></span>Live status tracking and full ticket history</li>
            <li><span><Icon name="shield" size={18} /></span>Secure role-based access for every team member</li>
          </ul>
        </div>

        <div className="auth-hero-foot">Web-Based Customer Care System</div>
      </aside>

      <main className="auth-panel">
        <div className={`auth-card ${wide ? 'wide' : ''}`}>
          <div className="auth-mobile-brand">
            <span className="brand-logo"><Icon name="headphones" size={20} /></span>
            CareDesk
          </div>
          <h2>{title}</h2>
          <p className="muted auth-sub">{subtitle}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
