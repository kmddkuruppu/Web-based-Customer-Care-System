import { useState } from 'react';
import TextAction from './TextAction';
import { ROLES } from '../../utils/constants';
import { ticketService } from '../../services/ticketService';

function StatusUpdate({ current, onSubmit }) {
  const options = ['ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER'];
  const [status, setStatus] = useState(options.includes(current) ? current : 'IN_PROGRESS');
  const [busy, setBusy] = useState(false);
  return (
    <div className="card action-card">
      <h4>Update Status</h4>
      <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
      </select>
      <button
        className="btn btn-primary"
        disabled={busy || status === current}
        onClick={async () => { setBusy(true); await onSubmit(status); setBusy(false); }}
      >
        Update Status
      </button>
    </div>
  );
}

export default function StaffActions({ ticket, role, run, ask }) {
  const id = ticket.id;
  const st = ticket.status;
  const closed = ['CLOSED', 'ARCHIVED'].includes(st);
  const finished = ['RESOLVED', 'CLOSED', 'ARCHIVED'].includes(st);
  const canEscalate = [ROLES.AGENT, ROLES.SUPERVISOR].includes(role) && st !== 'ESCALATED' && !finished;
  const canNote = [ROLES.SENIOR, ROLES.SUPERVISOR].includes(role);

  return (
    <>
      {!closed && (
        <TextAction
          title="Respond to Customer"
          placeholder="Write your response..."
          button="Send Response"
          onSubmit={(t) => run(() => ticketService.addResponse(id, t), 'Response sent.')}
        />
      )}

      {!closed && (
        <StatusUpdate
          current={st}
          onSubmit={(s) => run(() => ticketService.updateStatus(id, s), 'Status updated.')}
        />
      )}

      {canNote && !closed && (
        <TextAction
          title="Add Internal Note"
          placeholder="Visible to staff only..."
          button="Save Note"
          variant="secondary"
          onSubmit={(t) => run(() => ticketService.addNote(id, t), 'Internal note added.')}
        />
      )}

      {canEscalate && (
        <TextAction
          title="Escalate Ticket"
          placeholder="Reason for escalation..."
          button="Escalate"
          variant="warning"
          onSubmit={async (t) =>
            (await ask('Escalate this ticket to a senior agent?')) &&
            run(() => ticketService.escalate(id, t), 'Ticket escalated.')
          }
        />
      )}

      {!finished && (
        <TextAction
          title="Record Resolution"
          placeholder="Describe how the issue was resolved..."
          button="Mark as Resolved"
          variant="success"
          min={5}
          onSubmit={(t) => run(() => ticketService.resolve(id, t), 'Ticket resolved.')}
        />
      )}

      {st === 'RESOLVED' && (
        <div className="card action-card">
          <h4>Close Ticket</h4>
          <p className="muted">The ticket is resolved. Close it to complete the workflow.</p>
          <button
            className="btn btn-success"
            onClick={async () =>
              (await ask('Close this ticket?')) && run(() => ticketService.close(id), 'Ticket closed.')
            }
          >
            Close Ticket
          </button>
        </div>
      )}

      {role === ROLES.SUPERVISOR && st === 'CLOSED' && (
        <div className="card action-card">
          <h4>Archive Ticket</h4>
          <button
            className="btn btn-secondary"
            onClick={async () =>
              (await ask('Archive this ticket?')) && run(() => ticketService.archive(id), 'Ticket archived.')
            }
          >
            Archive Ticket
          </button>
        </div>
      )}
    </>
  );
}
