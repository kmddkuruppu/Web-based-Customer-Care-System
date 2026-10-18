import { formatDate, personName } from '../../utils/helpers';

export default function TicketTimeline({ history }) {
  if (!history.length) return <p className="muted">No history recorded yet.</p>;
  return (
    <ul className="timeline">
      {history.map((h, i) => (
        <li key={h.id || i}>
          <span className="dot" />
          <div>
            <strong>{String(h.action || h.status || 'UPDATE').replace(/_/g, ' ')}</strong>
            {(h.details || h.comment || h.note) && <div className="muted small">{h.details || h.comment || h.note}</div>}
            <div className="muted small">
              {personName(h.performedBy || h.changedBy || h.user)} · {formatDate(h.createdAt || h.timestamp)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
