import { useEffect, useMemo, useState } from 'react';
import Alert from './Alert';
import Icon from './Icon';
import TicketFilters from './TicketFilters';
import TicketTable from './TicketTable';
import { useFetch } from '../utils/useFetch';
import { asList, byNewest, filterTickets } from '../utils/helpers';
import { EMPTY_FILTERS } from '../utils/constants';

/* Animations are embedded, so no tailwind.config changes are needed.
   Everything is switched off for people who prefer reduced motion. */
const CSS = `
@keyframes tl-rise    { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes tl-float   { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-9px) rotate(var(--r,0deg)); } }
@keyframes tl-flow    { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes tl-drift   { 0%,100% { transform: translate(0,0); } 50% { transform: translate(18px,14px); } }
@keyframes tl-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
@keyframes tl-pop     { 0% { transform: scale(.94); } 55% { transform: scale(1.06); } 100% { transform: scale(1); } }
@keyframes tl-sweep   { 0% { transform: translateX(-130%); } 60%,100% { transform: translateX(130%); } }

.tl-rise    { animation: tl-rise .65s cubic-bezier(.2,.8,.2,1) both; }
.tl-float   { animation: tl-float 6s ease-in-out infinite; }
.tl-flow    { background-size: 220% 220%; animation: tl-flow 16s ease-in-out infinite; }
.tl-drift   { animation: tl-drift 13s ease-in-out infinite; }
.tl-pop     { animation: tl-pop .35s ease-out; }
.tl-shimmer { background: linear-gradient(90deg, #f1f3fb 25%, #e3e7f7 40%, #f1f3fb 60%); background-size: 300% 100%; animation: tl-shimmer 1.6s linear infinite; }

.tl-rows tbody tr { animation: tl-rise .5s cubic-bezier(.2,.8,.2,1) both; animation-delay: .5s; }
.tl-rows tbody tr:nth-child(1) { animation-delay: .35s; }
.tl-rows tbody tr:nth-child(2) { animation-delay: .41s; }
.tl-rows tbody tr:nth-child(3) { animation-delay: .47s; }
.tl-rows tbody tr:nth-child(4) { animation-delay: .53s; }
.tl-rows tbody tr:nth-child(5) { animation-delay: .59s; }
.tl-rows tbody tr:nth-child(6) { animation-delay: .65s; }
.tl-rows tbody tr:nth-child(7) { animation-delay: .71s; }
.tl-rows tbody tr:nth-child(8) { animation-delay: .77s; }

.tl-cta { position: relative; overflow: hidden; }
.tl-cta::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%);
  transform: translateX(-130%); animation: tl-sweep 3.4s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .tl *, .tl *::before, .tl *::after { animation: none !important; transition: none !important; }
}
`;

/* Full class names so Tailwind can detect them at build time. */
const DOT = {
  OPEN: 'bg-indigo-500',
  ASSIGNED: 'bg-violet-500',
  IN_PROGRESS: 'bg-amber-500',
  WAITING_FOR_CUSTOMER: 'bg-orange-500',
  ESCALATED: 'bg-rose-500',
  RESOLVED: 'bg-emerald-500',
  CLOSED: 'bg-slate-400',
  ARCHIVED: 'bg-slate-300',
};

const label = (s) => s.replace(/_/g, ' ').toLowerCase();

function CountUp({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value);
      return undefined;
    }
    let raf;
    const from = 0;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / 700, 1);
      setN(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{n}</>;
}

function TicketStack() {
  return (
    <div className="relative h-28 w-44" aria-hidden="true">
      <div className="tl-float absolute left-2 top-6 h-20 w-32 rounded-xl bg-white/25" style={{ '--r': '-8deg' }} />
      <div className="tl-float absolute left-8 top-3 h-20 w-32 rounded-xl bg-white/40" style={{ '--r': '5deg', animationDelay: '-2s' }} />
      <div className="tl-float absolute left-12 top-0 h-20 w-32 rounded-xl bg-white p-3 shadow-xl shadow-indigo-900/25" style={{ '--r': '-1deg', animationDelay: '-4s' }}>
        <div className="h-2 w-10 rounded-full bg-indigo-500" />
        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200" />
        <div className="mt-1.5 h-1.5 w-4/5 rounded-full bg-slate-100" />
        <div className="mt-3 flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-full bg-emerald-500" />
          <span className="h-1.5 w-10 rounded-full bg-emerald-200" />
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3 py-1" role="status" aria-label="Loading tickets">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4" style={{ opacity: 1 - i * 0.12 }}>
          <div className="tl-shimmer h-9 w-20 rounded-lg" />
          <div className="tl-shimmer h-9 flex-1 rounded-lg" />
          <div className="tl-shimmer hidden h-9 w-24 rounded-full sm:block" />
          <div className="tl-shimmer hidden h-9 w-20 rounded-full md:block" />
        </div>
      ))}
    </div>
  );
}

function Empty({ filtered, onClear }) {
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <span className="tl-float relative grid h-20 w-20 place-items-center rounded-full bg-indigo-50 text-indigo-500">
        <Icon name="inbox" size={34} />
        <span className="absolute inset-0 rounded-full ring-8 ring-indigo-50/60" />
      </span>
      <h3 className="mb-1 mt-5 text-lg font-extrabold text-indigo-950">
        {filtered ? 'No tickets match these filters' : 'No tickets here yet'}
      </h3>
      <p className="mb-5 mt-0 max-w-sm text-sm text-slate-500">
        {filtered ? 'Try a different search or clear the filters to see everything again.' : 'Tickets will appear here as soon as there are some.'}
      </p>
      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="tl-cta inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function TicketListPage({ title, fetcher, basePath, hideStatus = false }) {
  const { data, loading, error } = useFetch(fetcher, []);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [tab, setTab] = useState('ALL');

  const all = useMemo(() => asList(data), [data]);
  const filtered = useMemo(() => filterTickets(all, filters).sort(byNewest), [all, filters]);

  /* status tabs are an extra quick filter on top of the normal filters */
  const counts = useMemo(() => {
    const c = {};
    filtered.forEach((t) => {
      c[t.status] = (c[t.status] || 0) + 1;
    });
    return c;
  }, [filtered]);
  const statuses = Object.keys(counts);
  const tickets = tab === 'ALL' ? filtered : filtered.filter((t) => t.status === tab);

  const filtersActive = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS) || tab !== 'ALL';
  const clear = () => {
    setFilters(EMPTY_FILTERS);
    setTab('ALL');
  };

  return (
    <div className="tl flex flex-col gap-6">
      <style>{CSS}</style>

      {/* header */}
      <header className="tl-flow tl-rise relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 px-6 py-7 text-white shadow-2xl shadow-indigo-500/30 sm:px-10">
        <span className="tl-drift absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-white/10" />
        <span className="tl-drift absolute -bottom-20 left-1/3 -z-10 h-40 w-40 rounded-full bg-white/10" style={{ animationDelay: '-6s' }} />
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="m-0 text-3xl font-extrabold tracking-tight text-white">{title}</h1>
            <p className="mb-0 mt-2 text-[15px] text-white/90">
              {loading ? (
                'Loading your tickets...'
              ) : (
                <>
                  <strong className="text-white">
                    <CountUp value={tickets.length} />
                  </strong>{' '}
                  {tickets.length === 1 ? 'ticket' : 'tickets'}
                  {filtersActive && all.length !== tickets.length ? ` shown of ${all.length}` : ''}
                </>
              )}
            </p>
          </div>
          <div className="hidden sm:block">
            <TicketStack />
          </div>
        </div>
      </header>

      <Alert message={error} />

      {/* status tabs */}
      {!hideStatus && !loading && statuses.length > 0 && (
        <div className="tl-rise -mb-2 flex gap-2 overflow-x-auto pb-1" style={{ animationDelay: '120ms' }} role="tablist" aria-label="Filter by status">
          {['ALL', ...statuses].map((s) => {
            const on = tab === s;
            const n = s === 'ALL' ? filtered.length : counts[s];
            return (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setTab(s)}
                className={`flex flex-none items-center gap-2 rounded-full border px-4 py-2 text-[13px] font-bold capitalize transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${
                  on
                    ? 'tl-pop border-transparent bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/40'
                    : 'border-[#e0e3f3] bg-white text-slate-600 hover:-translate-y-0.5 hover:border-indigo-300 hover:text-indigo-700'
                }`}
              >
                {s !== 'ALL' && <span className={`h-2 w-2 rounded-full ${on ? 'bg-white' : DOT[s] || 'bg-slate-400'}`} />}
                {s === 'ALL' ? 'All' : label(s)}
                <span className={`rounded-full px-2 py-0.5 text-[11px] ${on ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}`}>{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* filters */}
      <div className="tl-rise" style={{ animationDelay: '200ms' }}>
        <TicketFilters filters={filters} onChange={setFilters} hideStatus={hideStatus} />
      </div>

      {/* list */}
      <section className="tl-rise rounded-2xl border border-[#e6e8f2] bg-white p-4 shadow-sm sm:p-6" style={{ animationDelay: '280ms' }}>
        {loading ? (
          <Skeleton />
        ) : tickets.length === 0 ? (
          <Empty filtered={filtersActive && all.length > 0} onClear={clear} />
        ) : (
          <div key={tab} className="tl-rows overflow-x-auto">
            <TicketTable tickets={tickets} basePath={basePath} />
          </div>
        )}
      </section>
    </div>
  );
}