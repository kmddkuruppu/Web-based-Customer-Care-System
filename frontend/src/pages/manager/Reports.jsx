import { reportService } from '../../services/reportService';
import { useFetch } from '../../utils/useFetch';
import { toEntries } from '../../utils/helpers';
import Alert from '../../components/Alert';
import BarChart from '../../components/BarChart';
import DonutChart from '../../components/DonutChart';
import Loader from '../../components/Loader';
import PageHero from '../../components/PageHero';
import StatCard from '../../components/StatCard';

export default function Reports() {
  const { data: r, loading, error } = useFetch(() => reportService.dashboard(), []);
  if (loading) return <Loader />;
  if (!r) return <Alert message={error || 'No report data.'} />;

  const avg = r.averageResolutionTime;
  const sat = r.customerSatisfaction;
  const workload = toEntries(r.agentWorkload);

  return (
    <>
      <PageHero
        eyebrow="Manager"
        title="Reports & Analytics"
        subtitle="Performance, workload and customer satisfaction at a glance."
      />
      <Alert message={error} />
      <div className="stat-grid">
        <StatCard label="Total Tickets" value={r.totalTickets ?? 0} color="blue" icon="inbox" />
        <StatCard label="Open Tickets" value={r.openTickets ?? 0} color="indigo" icon="clock" />
        <StatCard label="Resolved" value={r.resolvedTickets ?? 0} color="green" icon="check-circle" />
        <StatCard label="Closed" value={r.closedTickets ?? 0} color="gray" icon="archive" />
        <StatCard label="Escalated" value={r.escalatedTickets ?? 0} color="red" icon="alert" />
        <StatCard label="Avg. Resolution Time" value={typeof avg === 'number' ? `${avg.toFixed(1)} hrs` : avg ?? '—'} color="cyan" icon="activity" />
        <StatCard label="Customer Satisfaction" value={typeof sat === 'number' ? `${sat.toFixed(1)} / 5` : sat ?? '—'} color="amber" icon="star" />
      </div>
      <div className="chart-grid">
        <BarChart title="Tickets by Category" data={toEntries(r.ticketsByCategory)} color="#6366f1" />
        <DonutChart title="Tickets by Priority" data={toEntries(r.ticketsByPriority)} />
      </div>
      <div className="chart-grid">
        <BarChart title="Agent Workload" data={workload} color="#8b5cf6" />
        <div className="card">
          <h4>Agent Workload Table</h4>
          {workload.length === 0 ? <p className="muted">No data.</p> : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Agent</th><th>Assigned Tickets</th></tr></thead>
                <tbody>{workload.map((w) => <tr key={w.label}><td>{w.label}</td><td>{w.value}</td></tr>)}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
