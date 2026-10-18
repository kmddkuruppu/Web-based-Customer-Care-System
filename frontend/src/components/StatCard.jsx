import Icon from './Icon';

export default function StatCard({ label, value, color = 'blue', icon = 'activity' }) {
  return (
    <div className={`stat-card stat-${color}`}>
      <div className="stat-icon"><Icon name={icon} size={22} /></div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
