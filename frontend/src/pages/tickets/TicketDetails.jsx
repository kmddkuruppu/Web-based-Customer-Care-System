import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { agentName, categoryName, errMsg, formatDate, personName, ticketCode } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import ConfirmModal from '../../components/ConfirmModal';
import { PriorityBadge, StatusBadge } from '../../components/Badges';
import TextAction from '../../components/ticket/TextAction';
import FeedbackForm from '../../components/ticket/FeedbackForm';
import ResponseThread from '../../components/ticket/ResponseThread';
import TicketTimeline from '../../components/ticket/TicketTimeline';
import StaffActions from '../../components/ticket/StaffActions';

export default function TicketDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirm, setConfirm] = useState(null);

  const isCustomer = user.role === ROLES.CUSTOMER;

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [t, r] = await Promise.all([
        ticketService.get(id),
        ticketService.getResponses(id).catch(() => ({ data: null })),
      ]);
      setTicket(t.data);
      setResponses(r.data || t.data.responses || []);
    } catch (e) {
      setError(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, msg) => {
    setError('');
    setSuccess('');
    try {
      await fn();
      setSuccess(msg);
      await load(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    } catch (e) {
      setError(errMsg(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return false;
    }
  };

  const ask = (message) => new Promise((res) => setConfirm({ message, res }));

  if (loading) return <Loader />;
  if (!ticket) return <Alert message={error || 'Ticket not found.'} />;

  const closed = ['CLOSED', 'ARCHIVED'].includes(ticket.status);
  const history = ticket.history || ticket.statusHistory || [];
  const notes = ticket.notes || ticket.internalNotes || [];
  const feedback = ticket.feedback;

  return (
    <>
      <div className="page-head">
        <h2 className="page-title">Ticket {ticketCode(ticket)}</h2>
        <button className="btn btn-outline" onClick={() => navigate(-1)}>← Back</button>
      </div>
      <Alert message={error} onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      <div className="details-grid">
        <div className="details-main">
          <div className="card">
            <h3>{ticket.title}</h3>
            <div className="info-grid">
              <div><small>Ticket ID</small><strong>{ticketCode(ticket)}</strong></div>
              <div><small>Category</small><strong>{categoryName(ticket)}</strong></div>
              <div><small>Priority</small><PriorityBadge value={ticket.priority} /></div>
              <div><small>Status</small><StatusBadge value={ticket.status} /></div>
              <div><small>Created</small><strong>{formatDate(ticket.createdAt)}</strong></div>
              <div><small>Assigned Agent</small><strong>{agentName(ticket)}</strong></div>
              {!isCustomer && <div><small>Customer</small><strong>{personName(ticket.customer)}</strong></div>}
            </div>
            <h4>Description</h4>
            <p className="pre">{ticket.description}</p>
          </div>

          {ticket.resolution && (
            <div className="card resolution-card">
              <h4>Resolution Details</h4>
              <p className="pre">{ticket.resolution}</p>
              {ticket.resolvedAt && <small className="muted">Resolved on {formatDate(ticket.resolvedAt)}</small>}
            </div>
          )}

          <div className="card">
            <h4>Responses</h4>
            <ResponseThread responses={responses} />
          </div>

          {!isCustomer && (
            <div className="card">
              <h4>Internal Notes</h4>
              {notes.length === 0 ? <p className="muted">No internal notes.</p> : notes.map((n, i) => (
                <div className="note" key={n.id || i}>
                  <p>{n.note || n.content || n.message}</p>
                  <small className="muted">{personName(n.author || n.createdBy)} · {formatDate(n.createdAt)}</small>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h4>Ticket History</h4>
            <TicketTimeline history={history} />
          </div>

          {feedback && (
            <div className="card">
              <h4>Customer Feedback</h4>
              <div className="stars static">
                {[1, 2, 3, 4, 5].map((n) => <span key={n} className={n <= feedback.rating ? 'star on' : 'star'}>★</span>)}
              </div>
              <p>{feedback.comment}</p>
            </div>
          )}
        </div>

        <div className="details-side">
          {isCustomer ? (
            <>
              {!closed && (
                <TextAction
                  title="Add a Reply"
                  placeholder="Write your reply..."
                  button="Send Reply"
                  onSubmit={(t) => run(() => ticketService.addResponse(id, t), 'Reply sent.')}
                />
              )}
              {ticket.status === 'RESOLVED' && (
                <div className="card action-card">
                  <h4>Confirm Closure</h4>
                  <p className="muted">Happy with the resolution? You can close this ticket.</p>
                  <button
                    className="btn btn-success"
                    onClick={async () => (await ask('Close this ticket?')) && run(() => ticketService.close(id), 'Ticket closed.')}
                  >
                    Close Ticket
                  </button>
                </div>
              )}
              {['RESOLVED', 'CLOSED'].includes(ticket.status) && !feedback && (
                <FeedbackForm onSubmit={(f) => run(() => ticketService.feedback(id, f), 'Thank you for your feedback!')} />
              )}
            </>
          ) : (
            <StaffActions ticket={ticket} role={user.role} run={run} ask={ask} />
          )}
        </div>
      </div>

      <ConfirmModal
        show={!!confirm}
        message={confirm?.message}
        onConfirm={() => { confirm.res(true); setConfirm(null); }}
        onCancel={() => { confirm.res(false); setConfirm(null); }}
      />
    </>
  );
}
