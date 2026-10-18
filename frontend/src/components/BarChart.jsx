export default function BarChart({ title, data, color = '#6366f1' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="card">
      <h4>{title}</h4>
      {data.length === 0 ? (
        <p className="muted">No data available.</p>
      ) : (
        data.map((d) => (
          <div className="bar-row" key={d.label}>
            <span className="bar-label">{String(d.label).replace(/_/g, ' ')}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(d.value / max) * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }}
              />
            </div>
            <span className="bar-value">{d.value}</span>
          </div>
        ))
      )}
    </div>
  );
}
