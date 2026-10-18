import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { useFetch } from '../../utils/useFetch';
import { asList, byNewest } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import PageHero from '../../components/PageHero';
import StatCard from '../../components/StatCard';
import TicketTable from '../../components/TicketTable';

export default function AgentDashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch(() => ticketService.assigned(), []);
  const tickets = asList(data);
  const count = (...s) => tickets.filter((t) => s.includes(t.status)).length;
  const recent = [...tickets].sort(byNewest).slice(0, 5);
  const firstName = (user.name || '').split(' ')[0];

  if (loading) return <Loader />;
  return (
    <>
      <PageHero
        eyebrow="Agent Dashboard"
        title={`Hello, ${firstName}`}
        subtitle="Here is the workload assigned to you today."
        action={
          <Link className="btn btn-light btn-icon" to="/agent/tickets">
            <Icon name="inbox" size={18} /> View All Assigned
          </Link>
        }
      />
      <Alert message={error} />
      <div className="stat-grid">
        <StatCard label="Assigned Tickets" value={tickets.length} color="blue" icon="inbox" />
        <StatCard label="Open Tickets" value={count('OPEN', 'ASSIGNED')} color="indigo" icon="clock" />
        <StatCard label="In Progress" value={count('IN_PROGRESS', 'WAITING_FOR_CUSTOMER')} color="amber" icon="activity" />
        <StatCard label="Escalated" value={count('ESCALATED')} color="red" icon="alert" />
        <StatCard label="Resolved" value={count('RESOLVED', 'CLOSED')} color="green" icon="check-circle" />
      </div>
      <div className="card">
        <h3 className="card-title">Latest Assigned Tickets</h3>
        <TicketTable tickets={recent} basePath="/agent/tickets" />
      </div>
    </>
  );
}
