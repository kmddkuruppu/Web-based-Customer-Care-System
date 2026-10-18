import { categoryService } from '../services/categoryService';
import { useFetch } from '../utils/useFetch';
import { asList } from '../utils/helpers';
import { EMPTY_FILTERS, PRIORITIES, STATUSES } from '../utils/constants';

export default function TicketFilters({ filters, onChange, hideStatus = false }) {
  const { data } = useFetch(() => categoryService.getAll(), []);
  const categories = asList(data);
  const set = (k, v) => onChange({ ...filters, [k]: v });

  return (
    <div className="card filters">
      <input
        className="input"
        placeholder="Search by Ticket ID"
        value={filters.search}
        onChange={(e) => set('search', e.target.value)}
      />
      {!hideStatus && (
        <select className="input" value={filters.status} onChange={(e) => set('status', e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      )}
      <select className="input" value={filters.category} onChange={(e) => set('category', e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
      </select>
      <select className="input" value={filters.priority} onChange={(e) => set('priority', e.target.value)}>
        <option value="">All Priorities</option>
        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
      <button className="btn btn-outline" onClick={() => onChange(EMPTY_FILTERS)}>Clear</button>
    </div>
  );
}
