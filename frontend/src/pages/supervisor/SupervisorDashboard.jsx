import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { useFetch } from '../../utils/useFetch';
import { agentName, asList } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import PageHero from '../../components/PageHero';
import StatCard from '../../components/StatCard';
import TicketTable from '../../components/TicketTable';

export default function SupervisorDashboard() {
  const { data, loading, error } = useFetch(() => ticketService.all(), []);
  const tickets = asList(data);

  const active = tickets.filter((t) => !['CLOSED', 'ARCHIVED'].includes(t.status));
  const unassigned = active.filter((t) => agentName(t) === 'Unassigned');
  const escalated = tickets.filter((t) => t.status === 'ESCALATED');
  const unresolved = active
    .filter((t) => t.status !== 'RESOLVED')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  if (loading) return <Loader />;
  return (
    <>
      <PageHero
        eyebrow="Supervisor Dashboard"
        title="Team overview"
        subtitle="Monitor active tickets, assignments and escalations."
        action={
          <Link className="btn btn-light btn-icon" to="/supervisor/tickets">
            <Icon name="user-check" size={18} /> Manage Assignments
          </Link>
        }
      />
      <Alert message={error} />
      <div className="stat-grid">
        <StatCard label="Active Tickets" value={active.length} color="blue" icon="inbox" />
        <StatCard label="Unassigned" value={unassigned.length} color="amber" icon="users" />
        <StatCard label="Escalated" value={escalated.length} color="red" icon="alert" />
        <StatCard label="Unresolved" value={unresolved.length} color="indigo" icon="clock" />
      </div>
      <div className="card">
        <h3 className="card-title">Unassigned Tickets</h3>
        <TicketTable tickets={unassigned.slice(0, 5)} basePath="/supervisor/tickets" />
      </div>
      <div className="card">
        <h3 className="card-title">Escalated Tickets</h3>
        <TicketTable tickets={escalated.slice(0, 5)} basePath="/supervisor/tickets" />
      </div>
      <div className="card">
        <h3 className="card-title">Oldest Unresolved Tickets</h3>
        <TicketTable tickets={unresolved.slice(0, 10)} basePath="/supervisor/tickets" />
      </div>
    </>
  );
}
