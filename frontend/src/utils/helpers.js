export const asList = (d) => (Array.isArray(d) ? d : d?.content || []);

export const formatDate = (d) => (d ? new Date(d).toLocaleString() : '—');
export const formatDay = (d) => (d ? new Date(d).toLocaleDateString() : '—');

export const ticketCode = (t) =>
  t?.ticketId || (t?.id ? `TCK-${String(t.id).padStart(5, '0')}` : '—');

export const categoryName = (t) =>
  typeof t?.category === 'object' ? t.category?.name || '—' : t?.category || '—';

export const personName = (p) =>
  !p ? 'System' : typeof p === 'string' ? p : p.fullName || p.name || 'User';

export const agentName = (t) => {
  const a = t?.assignedAgent || t?.assignedTo;
  if (!a) return 'Unassigned';
  return typeof a === 'string' ? a : a.fullName || a.name || 'Unassigned';
};

export const errMsg = (e) => {
  const d = e?.response?.data;
  if (d) {
    if (typeof d === 'string') return d;
    if (d.message) return d.message;
    if (d.error) return d.error;
  }
  if (e?.response) return `Request failed (${e.response.status})`;
  return 'Cannot reach the server. Please make sure the backend is running.';
};

export const toEntries = (v) =>
  Array.isArray(v)
    ? v.map((x) => ({
        label: x.label || x.name || x.category || x.priority || x.agentName || x.agent || 'N/A',
        value: Number(x.value ?? x.count ?? x.tickets ?? x.total ?? 0),
      }))
    : Object.entries(v || {}).map(([label, value]) => ({ label, value: Number(value) }));

export const filterTickets = (tickets, f) =>
  tickets.filter((t) => {
    const q = f.search.trim().toLowerCase();
    if (q && !ticketCode(t).toLowerCase().includes(q) && String(t.id) !== q) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.category && categoryName(t) !== f.category) return false;
    if (f.priority && t.priority !== f.priority) return false;
    return true;
  });

export const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
