import { Link } from 'react-router-dom';
import { PriorityBadge, StatusBadge } from './Badges';
import Icon from './Icon';
import { categoryName, formatDay, ticketCode } from '../utils/helpers';

export default function TicketTable({ tickets, basePath, renderActions }) {
  if (!tickets.length) {
    return (
      <div className="empty">
        <div className="empty-icon"><Icon name="inbox" size={30} /></div>
        <p>No tickets found.</p>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Ticket ID</th><th>Title</th><th>Category</th><th>Priority</th>
            <th>Status</th><th>Created Date</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td><span className="code-pill">{ticketCode(t)}</span></td>
              <td className="cell-title">{t.title}</td>
              <td>{categoryName(t)}</td>
              <td><PriorityBadge value={t.priority} /></td>
              <td><StatusBadge value={t.status} /></td>
              <td>{formatDay(t.createdAt)}</td>
              <td>
                <div className="btn-group">
                  <Link className="btn btn-primary btn-sm" to={`${basePath}/${t.id}`}>View</Link>
                  {renderActions && renderActions(t)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
