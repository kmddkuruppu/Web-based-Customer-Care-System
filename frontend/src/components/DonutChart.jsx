const COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6'];

export default function DonutChart({ title, data }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let acc = 0;
  const stops = data
    .map((d, i) => {
      const start = (acc / total) * 100;
      acc += d.value;
      const end = (acc / total) * 100;
      return `${COLORS[i % COLORS.length]} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="card">
      <h4>{title}</h4>
      {total === 0 ? (
        <p className="muted">No data available.</p>
      ) : (
        <div className="donut-wrap">
          <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
            <div className="donut-hole">
              <strong>{total}</strong>
              <span>tickets</span>
            </div>
          </div>
          <ul className="legend">
            {data.map((d, i) => (
              <li key={d.label}>
                <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="legend-label">{String(d.label).replace(/_/g, ' ')}</span>
                <b>{d.value}</b>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
