import { ROLE_LABELS } from '../../utils/constants';
import { formatDate, personName } from '../../utils/helpers';

export default function ResponseThread({ responses }) {
  if (!responses.length) return <p className="muted">No responses yet.</p>;
  return (
    <div className="thread">
      {responses.map((r, i) => {
        const who = r.sender || r.author || r.respondedBy || r.user;
        const role = r.senderRole || who?.role;
        const fromCustomer = role === 'CUSTOMER';
        return (
          <div key={r.id || i} className={`bubble ${fromCustomer ? 'bubble-customer' : 'bubble-staff'}`}>
            <div className="bubble-head">
              <strong>{personName(who)}</strong>
              {role && <span className="muted small"> · {ROLE_LABELS[role] || role}</span>}
            </div>
            <p>{r.message || r.content}</p>
            <div className="muted small">{formatDate(r.createdAt)}</div>
          </div>
        );
      })}
    </div>
  );
}
