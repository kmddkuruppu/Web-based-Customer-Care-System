export function StatusBadge({ value }) {
  return (
    <span className={`badge badge-${value}`}>
      <i className="badge-dot" />
      {String(value || '').replace(/_/g, ' ')}
    </span>
  );
}

export function PriorityBadge({ value }) {
  return (
    <span className={`badge badge-${value}`}>
      <i className="badge-dot" />
      {value}
    </span>
  );
}
