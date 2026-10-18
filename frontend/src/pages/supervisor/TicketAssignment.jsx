import { useMemo, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import { userService } from '../../services/userService';
import { useFetch } from '../../utils/useFetch';
import { agentName, asList, byNewest, errMsg, filterTickets, ticketCode } from '../../utils/helpers';
import { EMPTY_FILTERS, PRIORITIES, ROLES } from '../../utils/constants';
import Alert from '../../components/Alert';
import Loader from '../../components/Loader';
import Modal from '../../components/Modal';
import TicketFilters from '../../components/TicketFilters';
import TicketTable from '../../components/TicketTable';

export default function TicketAssignment() {
  const { data, loading, error, reload } = useFetch(() => ticketService.all(), []);
  const { data: userData } = useFetch(() => userService.list(), []);
  const agents = asList(userData).filter(
    (u) => [ROLES.AGENT, ROLES.SENIOR].includes(u.role) && (u.enabled ?? true)
  );

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [modal, setModal] = useState(null);
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [formErr, setFormErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');

  const tickets = useMemo(() => filterTickets(asList(data), filters).sort(byNewest), [data, filters]);

  const open = (type, ticket) => {
    setModal({ type, ticket });
    setValue(type === 'priority' ? ticket.priority : '');
    setReason('');
    setFormErr('');
  };

  const submit = async () => {
    const { type, ticket } = modal;
    if (type === 'assign' && !value) return setFormErr('Please select an agent.');
    if (type === 'escalate' && reason.trim().length < 3) return setFormErr('Please provide an escalation reason.');
    setBusy(true);
    try {
      if (type === 'assign') await ticketService.assign(ticket.id, value);
      if (type === 'priority') await ticketService.setPriority(ticket.id, value);
      if (type === 'escalate') await ticketService.escalate(ticket.id, reason.trim());
      setSuccess(`Ticket ${ticketCode(ticket)} updated successfully.`);
      setModal(null);
      reload();
    } catch (e) {
      setFormErr(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const titles = { assign: 'Assign / Reassign Ticket', priority: 'Change Priority', escalate: 'Escalate Ticket' };
  const locked = (t) => ['RESOLVED', 'CLOSED', 'ARCHIVED'].includes(t.status);

  return (
    <>
      <h2 className="page-title">Ticket Assignment</h2>
      <Alert message={error} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <TicketFilters filters={filters} onChange={setFilters} />
      {loading ? <Loader /> : (
        <div className="card">
          <TicketTable
            tickets={tickets}
            basePath="/supervisor/tickets"
            renderActions={(t) => (
              <>
                <button className="btn btn-outline btn-sm" disabled={locked(t)} onClick={() => open('assign', t)}>
                  {agentName(t) === 'Unassigned' ? 'Assign' : 'Reassign'}
                </button>
                <button className="btn btn-outline btn-sm" disabled={locked(t)} onClick={() => open('priority', t)}>Priority</button>
                <button className="btn btn-warning btn-sm" disabled={locked(t) || t.status === 'ESCALATED'} onClick={() => open('escalate', t)}>Escalate</button>
              </>
            )}
          />
        </div>
      )}

      <Modal
        show={!!modal}
        title={modal ? `${titles[modal.type]} — ${ticketCode(modal.ticket)}` : ''}
        onClose={() => setModal(null)}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submit} disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </>
        }
      >
        {modal?.type === 'assign' && (
          <select className="input" value={value} onChange={(e) => setValue(e.target.value)}>
            <option value="">Select agent</option>
            {agents.map((a) => <option key={a.id} value={a.id}>{a.fullName} ({a.role === ROLES.SENIOR ? 'Senior' : 'Agent'})</option>)}
          </select>
        )}
        {modal?.type === 'priority' && (
          <select className="input" value={value} onChange={(e) => setValue(e.target.value)}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </select>
        )}
        {modal?.type === 'escalate' && (
          <textarea className="input" rows={3} placeholder="Reason for escalation..." value={reason} onChange={(e) => setReason(e.target.value)} />
        )}
        {formErr && <small className="field-error">{formErr}</small>}
      </Modal>
    </>
  );
}
