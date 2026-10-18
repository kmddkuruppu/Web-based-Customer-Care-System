import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService } from '../../services/ticketService';
import { useFetch } from '../../utils/useFetch';
import { asList, byNewest } from '../../utils/helpers';
import Alert from '../../components/Alert';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import TicketTable from '../../components/TicketTable';

/* ---------------------------------------------------------------------
   Animations live here, so no tailwind.config changes are needed.
   Everything is switched off for people who prefer reduced motion.
   --------------------------------------------------------------------- */
const CSS = `
@keyframes cd-rise   { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes cd-word   { from { opacity: 0; transform: translateY(.7em) rotate(3deg); } to { opacity: 1; transform: none; } }
@keyframes cd-float  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
@keyframes cd-drift  { 0%,100% { transform: translate(0,0); } 50% { transform: translate(22px,16px); } }
@keyframes cd-flow   { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes cd-dots   { 0%,80%,100% { opacity: .25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
@keyframes cd-steam  { 0% { opacity: 0; transform: translateY(0); } 30% { opacity: .85; } 100% { opacity: 0; transform: translateY(-14px); } }
@keyframes cd-sway   { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
@keyframes cd-blink  { 0%,92%,100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
@keyframes cd-sweep  { 0% { transform: translateX(-130%); } 55%,100% { transform: translateX(130%); } }
@keyframes cd-wiggle { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-10deg) scale(1.08); } 60% { transform: rotate(8deg) scale(1.08); } }
@keyframes cd-grow   { from { height: 0; } to { height: 100%; } }

.cd-rise  { animation: cd-rise .7s cubic-bezier(.2,.8,.2,1) both; }
.cd-word  { animation: cd-word .7s cubic-bezier(.2,.8,.2,1) both; }
.cd-float { animation: cd-float 6s ease-in-out infinite; }
.cd-drift { animation: cd-drift 14s ease-in-out infinite; }
.cd-flow  { background-size: 220% 220%; animation: cd-flow 16s ease-in-out infinite; }
.cd-grow  { animation: cd-grow 1.6s .9s ease-out both; }

.cd-svg   { transform-box: fill-box; }
.cd-dot   { transform-box: fill-box; animation: cd-dots 1.3s ease-in-out infinite; }
.cd-steam { transform-box: fill-box; animation: cd-steam 3s ease-out infinite; }
.cd-sway  { transform-box: fill-box; transform-origin: 50% 100%; animation: cd-sway 4.5s ease-in-out infinite; }
.cd-blink { transform-box: fill-box; transform-origin: center; animation: cd-blink 5s infinite; }

.cd-cta { position: relative; overflow: hidden; }
.cd-cta::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(110deg, transparent 30%, rgba(165,180,252,.6) 50%, transparent 70%);
  transform: translateX(-130%); animation: cd-sweep 3.6s ease-in-out 1.6s infinite;
}

.cd-card:hover .cd-icon { animation: cd-wiggle .6s ease-in-out; }

.cd-rows tbody tr { animation: cd-rise .55s cubic-bezier(.2,.8,.2,1) both; }
.cd-rows tbody tr:nth-child(1) { animation-delay: .85s; }
.cd-rows tbody tr:nth-child(2) { animation-delay: .95s; }
.cd-rows tbody tr:nth-child(3) { animation-delay: 1.05s; }
.cd-rows tbody tr:nth-child(4) { animation-delay: 1.15s; }
.cd-rows tbody tr:nth-child(5) { animation-delay: 1.25s; }

@media (prefers-reduced-motion: reduce) {
  .cd *, .cd *::before, .cd *::after { animation: none !important; transition: none !important; }
  .cd-par { transform: none !important; }
}
`;

/* ------------------------- small animated helpers ------------------------- */

function CountUp({ value, suffix = '' }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(value);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / 1000, 1);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <>
      {n}
      {suffix}
    </>
  );
}

function Bar({ pct, className, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 300 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div
      className={`h-full rounded-full transition-[width] duration-1000 ease-out ${className}`}
      style={{ width: `${w}%` }}
    />
  );
}

/* ------------------------- illustrated, animated scene ------------------------- */

function SupportScene() {
  return (
    <svg viewBox="0 0 480 340" className="absolute inset-0 h-full w-full" role="img" aria-label="Support agent replying to a customer">
      <defs>
        <linearGradient id="sc-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#eef2ff" />
        </linearGradient>
        <linearGradient id="sc-shirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      <circle cx="260" cy="170" r="150" fill="#ffffff" opacity=".10" />
      <circle cx="260" cy="170" r="105" fill="#ffffff" opacity=".10" />

      {/* plant, leaves sway */}
      <rect x="396" y="236" width="34" height="38" rx="8" fill="#312e81" />
      <path className="cd-sway" d="M413 238c-22-14-26-44-10-66 6 24 12 38 10 66z" fill="#34d399" />
      <path className="cd-sway" style={{ animationDelay: '-1.5s' }} d="M413 238c18-12 30-38 20-62-10 22-18 36-20 62z" fill="#10b981" />
      <path className="cd-sway" style={{ animationDelay: '-3s' }} d="M413 238c-4-20 0-44 8-60 2 22 0 42-8 60z" fill="#6ee7b7" />

      {/* agent */}
      <path d="M268 286c0-46 24-74 62-74s62 28 62 74z" fill="url(#sc-shirt)" />
      <path d="M312 214l18 22 18-22" fill="none" stroke="#ede9fe" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="320" y="186" width="20" height="30" rx="8" fill="#f2c7a3" />
      <circle cx="330" cy="160" r="36" fill="#f8d4b4" />
      <path d="M294 158c-2-30 18-48 40-46 22 2 34 20 30 44-8-18-22-24-38-24-14 0-26 8-32 26z" fill="#1e1b4b" />
      <circle className="cd-blink" cx="318" cy="164" r="3.2" fill="#1e1b4b" />
      <circle className="cd-blink" cx="342" cy="164" r="3.2" fill="#1e1b4b" />
      <path d="M319 178c6 7 16 7 22 0" fill="none" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
      <path d="M293 160c-2-34 20-52 40-50 22 2 38 20 34 50" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
      <rect x="286" y="152" width="14" height="28" rx="7" fill="#4f46e5" />
      <path d="M293 180c0 16 10 22 24 24" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <circle cx="320" cy="205" r="5" fill="#d946ef" />

      {/* monitor with a live chat */}
      <rect x="70" y="96" width="200" height="140" rx="14" fill="#1e1b4b" />
      <rect x="78" y="104" width="184" height="124" rx="9" fill="url(#sc-screen)" />
      <rect x="78" y="104" width="184" height="22" rx="9" fill="#6366f1" />
      <circle cx="91" cy="115" r="3.5" fill="#fff" opacity=".9" />
      <circle cx="102" cy="115" r="3.5" fill="#fff" opacity=".6" />
      <circle cx="113" cy="115" r="3.5" fill="#fff" opacity=".4" />
      <rect x="92" y="138" width="92" height="22" rx="10" fill="#e0e7ff" />
      <rect x="100" y="146" width="56" height="6" rx="3" fill="#818cf8" />
      <rect x="150" y="168" width="98" height="22" rx="10" fill="#8b5cf6" />
      <rect x="158" y="176" width="62" height="6" rx="3" fill="#fff" opacity=".85" />
      <rect x="92" y="198" width="52" height="22" rx="11" fill="#d1fae5" />
      <circle className="cd-dot" cx="106" cy="209" r="3.4" fill="#059669" />
      <circle className="cd-dot" style={{ animationDelay: '.18s' }} cx="118" cy="209" r="3.4" fill="#059669" />
      <circle className="cd-dot" style={{ animationDelay: '.36s' }} cx="130" cy="209" r="3.4" fill="#059669" />
      <rect x="150" y="236" width="40" height="22" fill="#312e81" />
      <rect x="126" y="256" width="88" height="8" rx="4" fill="#312e81" />

      {/* desk, mug and steam */}
      <rect x="30" y="272" width="420" height="16" rx="8" fill="#4338ca" />
      <rect x="60" y="288" width="12" height="40" rx="4" fill="#312e81" />
      <rect x="408" y="288" width="12" height="40" rx="4" fill="#312e81" />
      <rect x="226" y="248" width="24" height="24" rx="6" fill="#f0abfc" />
      <path d="M250 254c10 0 10 14 0 14" fill="none" stroke="#f0abfc" strokeWidth="4" />
      <path className="cd-steam" d="M233 242c-4-6 4-8 0-14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path className="cd-steam" style={{ animationDelay: '1s' }} d="M243 242c-4-6 4-8 0-14" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------- data ------------------------------- */

/* Full class names so Tailwind can detect them at build time. */
const STEPS = [
  { key: 'OPEN', label: 'Open', hint: 'Waiting for an agent', icon: 'clock', grad: 'from-indigo-500 to-violet-500', shadow: 'shadow-indigo-500/40', bar: 'bg-indigo-500', ping: 'bg-indigo-400', dot: 'bg-indigo-500', live: true },
  { key: 'IN_PROGRESS', label: 'In progress', hint: 'An agent is working on it', icon: 'activity', grad: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/40', bar: 'bg-amber-500', ping: 'bg-amber-400', dot: 'bg-amber-500', live: true },
  { key: 'RESOLVED', label: 'Resolved', hint: 'Solution delivered', icon: 'check-circle', grad: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/40', bar: 'bg-emerald-500' },
  { key: 'CLOSED', label: 'Closed', hint: 'Completed and archived', icon: 'archive', grad: 'from-slate-500 to-slate-400', shadow: 'shadow-slate-500/40', bar: 'bg-slate-400' },
];

const HOW_IT_WORKS = [
  { title: 'Submit your complaint', text: 'Describe the problem and add any details.' },
  { title: 'An agent takes it', text: 'You are notified as the status changes.' },
  { title: 'Get your solution', text: 'Review the resolution, then rate the service.' },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/* hover:no-underline: the global CSS underlines every <a> on hover */
const btn =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 hover:no-underline focus:outline-none focus-visible:ring-4';

/* ------------------------------- hero ------------------------------- */

function Hero({ firstName, total, active, rate, latest }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--px', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    e.currentTarget.style.setProperty('--py', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  };
  const leave = (e) => {
    e.currentTarget.style.setProperty('--px', 0);
    e.currentTarget.style.setProperty('--py', 0);
  };

  const words = `${greeting()}, ${firstName}.`.split(' ');
  const sub =
    total === 0
      ? 'No complaints yet. If something goes wrong, tell us here and we will follow it through.'
      : active > 0
      ? `${active} ${active === 1 ? 'complaint is' : 'complaints are'} being handled right now. Here is where each one stands.`
      : 'All your complaints have been resolved. Thanks for your patience.';

  return (
    <section
      onMouseMove={move}
      onMouseLeave={leave}
      className="cd-flow relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 text-white shadow-2xl shadow-indigo-500/30"
    >
      <span className="cd-drift absolute -right-20 -top-32 -z-10 h-72 w-72 rounded-full bg-white/10" />
      <span className="cd-drift absolute -bottom-24 left-1/3 -z-10 h-44 w-44 rounded-full bg-white/10" style={{ animationDelay: '-7s' }} />

      <div className="grid items-center gap-6 px-6 py-9 sm:px-10 md:grid-cols-[1.1fr_1fr] md:py-12">
        <div>
          <span className="cd-rise inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
            Customer dashboard
          </span>
          <h1 className="m-0 mt-4 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            {words.map((w, i) => (
              <span key={i} className="cd-word inline-block" style={{ animationDelay: `${150 + i * 120}ms` }}>
                {w}
                {i < words.length - 1 ? '\u00A0' : ''}
              </span>
            ))}
          </h1>
          <p className="cd-rise mb-0 mt-3 max-w-md text-base leading-relaxed text-white/90" style={{ animationDelay: '550ms' }}>
            {sub}
          </p>
          <div className="cd-rise mt-7 flex flex-wrap gap-3" style={{ animationDelay: '700ms' }}>
            <Link
              to="/customer/submit"
              className={`${btn} cd-cta bg-white text-indigo-700 shadow-xl shadow-indigo-900/30 hover:bg-indigo-50 focus-visible:ring-white/50`}
            >
              <Icon name="plus" size={18} /> New complaint
            </Link>
            {total > 0 && (
              <Link
                to="/customer/tickets"
                className={`${btn} border border-white/40 text-white hover:bg-white/10 focus-visible:ring-white/40`}
              >
                View all tickets
              </Link>
            )}
          </div>
        </div>

        {/* scene and cards drift against each other when the mouse moves */}
        <div className="relative hidden h-[300px] md:block">
          <div
            className="cd-par absolute inset-0 transition-transform duration-300 ease-out"
            style={{ transform: 'translate3d(calc(var(--px,0) * -14px), calc(var(--py,0) * -10px), 0)' }}
          >
            <SupportScene />
          </div>

          {latest && (
            <div
              className="cd-par absolute left-0 top-2 transition-transform duration-300 ease-out"
              style={{ transform: 'translate3d(calc(var(--px,0) * 20px), calc(var(--py,0) * 14px), 0)' }}
            >
              <div className="cd-float w-60 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-xl shadow-indigo-900/20 backdrop-blur-md">
                <p className="m-0 text-[11px] font-semibold text-white/80">Latest ticket</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="code-pill">{latest.ticketCode || latest.code || `#${latest.id}`}</span>
                  <span className={`badge badge-${latest.status}`}>
                    <span className="badge-dot" />
                    {(latest.status || '').replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
                <p className="mb-0 mt-2 truncate text-sm font-semibold text-white">
                  {latest.title || latest.subject || 'Untitled complaint'}
                </p>
              </div>
            </div>
          )}

          <div
            className="cd-par absolute bottom-3 right-0 transition-transform duration-300 ease-out"
            style={{ transform: 'translate3d(calc(var(--px,0) * 24px), calc(var(--py,0) * 16px), 0)' }}
          >
            <div className="cd-float w-52 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-xl shadow-indigo-900/20 backdrop-blur-md" style={{ animationDelay: '-3s' }}>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-white/85">Resolved</span>
                <span className="text-xl font-extrabold text-white">
                  <CountUp value={rate} suffix="%" />
                </span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/25">
                <Bar pct={rate} className="bg-emerald-300" delay={400} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------- pipeline card with spotlight ----------------------- */

function PipelineCard({ step, n, pct, index }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div
      onMouseMove={move}
      className="cd-card cd-rise group relative overflow-hidden rounded-2xl border border-[#e6e8f2] bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
      style={{ animationDelay: `${350 + index * 110}ms` }}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'radial-gradient(240px circle at var(--mx,50%) var(--my,50%), rgba(99,102,241,.14), transparent 70%)' }}
      />
      <div className="relative flex items-start justify-between">
        <span
          className={`cd-icon grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${step.grad} ${step.shadow}`}
        >
          <Icon name={step.icon} size={22} />
        </span>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500">
          {index + 1}
        </span>
      </div>
      <div className="relative mt-4 text-3xl font-extrabold leading-none text-indigo-950">
        <CountUp value={n} />
      </div>
      <div className="relative mt-1.5 flex items-center gap-2 text-sm font-bold text-indigo-950">
        {step.label}
        {step.live && n > 0 && (
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${step.ping}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${step.dot}`} />
          </span>
        )}
      </div>
      <div className="relative text-xs text-slate-500">{step.hint}</div>
      <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <Bar pct={pct} className={step.bar} delay={index * 110} />
      </div>
    </div>
  );
}

/* ------------------------------- page ------------------------------- */

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data, loading, error } = useFetch(() => ticketService.my(), []);
  const tickets = asList(data);
  const count = (s) => tickets.filter((t) => t.status === s).length;
  const recent = [...tickets].sort(byNewest).slice(0, 5);
  const latest = recent[0];
  const firstName = (user.name || '').split(' ')[0];

  const total = tickets.length;
  const active = count('OPEN') + count('IN_PROGRESS');
  const done = count('RESOLVED') + count('CLOSED');
  const rate = total ? Math.round((done / total) * 100) : 0;

  if (loading) return <Loader />;

  return (
    <div className="cd flex flex-col gap-6">
      <style>{CSS}</style>

      <Hero firstName={firstName} total={total} active={active} rate={rate} latest={latest} />

      <Alert message={error} />

      {/* pipeline */}
      <section aria-labelledby="cd-pipeline">
        <div className="cd-rise mb-3 flex items-end justify-between gap-3" style={{ animationDelay: '300ms' }}>
          <h2 id="cd-pipeline" className="m-0 text-lg font-extrabold text-indigo-950">
            Your tickets at a glance
          </h2>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
            {total} {total === 1 ? 'ticket' : 'tickets'} in total
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STEPS.map((s, i) => (
            <PipelineCard
              key={s.key}
              step={s}
              index={i}
              n={count(s.key)}
              pct={total ? Math.round((count(s.key) / total) * 100) : 0}
            />
          ))}
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.8fr_1fr]">
        {/* recent tickets */}
        <section
          aria-labelledby="cd-recent"
          className="cd-rise rounded-2xl border border-[#e6e8f2] bg-white p-5 shadow-sm sm:p-6"
          style={{ animationDelay: '750ms' }}
        >
          <header className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 id="cd-recent" className="m-0 text-lg font-extrabold text-indigo-950">
                Recent tickets
              </h2>
              <p className="mb-0 mt-1 text-sm text-slate-500">Your five latest complaints</p>
            </div>
            {total > 5 && (
              <Link to="/customer/tickets" className="text-sm font-bold text-indigo-600 hover:underline">
                See all {total}
              </Link>
            )}
          </header>

          {recent.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <span className="cd-float grid h-16 w-16 place-items-center rounded-full bg-indigo-50 text-indigo-500">
                <Icon name="inbox" size={28} />
              </span>
              <h3 className="mb-1 mt-4 text-lg font-extrabold text-indigo-950">No tickets yet</h3>
              <p className="mb-5 mt-0 text-sm text-slate-500">Your complaints will appear here once you submit one.</p>
              <Link
                to="/customer/submit"
                className={`${btn} bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/40 focus-visible:ring-indigo-200`}
              >
                <Icon name="plus" size={18} /> Submit your first complaint
              </Link>
            </div>
          ) : (
            <div className="cd-rows -mx-2 overflow-x-auto px-2">
              <TicketTable tickets={recent} basePath="/customer/tickets" />
            </div>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <aside
            className="cd-rise relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-800 p-6 text-white shadow-xl shadow-indigo-900/20"
            style={{ animationDelay: '850ms' }}
          >
            <span className="cd-drift absolute -right-10 -top-10 -z-10 h-36 w-36 rounded-full bg-fuchsia-500/20" />
            <h2 className="m-0 text-lg font-extrabold text-white">Something not right?</h2>
            <p className="mb-5 mt-2 text-sm leading-relaxed text-indigo-100">
              Tell us what happened. Our team replies on the ticket and you can follow every update here.
            </p>
            <Link
              to="/customer/submit"
              className={`${btn} bg-white text-indigo-700 shadow-lg shadow-indigo-950/30 hover:bg-indigo-50 focus-visible:ring-white/50`}
            >
              <Icon name="plus" size={18} /> Raise a complaint
            </Link>
          </aside>

          <section
            aria-labelledby="cd-how"
            className="cd-rise rounded-2xl border border-[#e6e8f2] bg-white p-6 shadow-sm"
            style={{ animationDelay: '950ms' }}
          >
            <h2 id="cd-how" className="m-0 text-lg font-extrabold text-indigo-950">
              What happens next
            </h2>
            <ol className="relative m-0 mt-4 list-none space-y-4 p-0">
              <span className="absolute bottom-3 left-[13px] top-3 w-0.5 bg-indigo-100" aria-hidden="true">
                <span className="cd-grow block w-full bg-gradient-to-b from-indigo-500 to-fuchsia-500" />
              </span>
              {HOW_IT_WORKS.map((s, i) => (
                <li key={s.title} className="relative flex gap-3">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-xs font-bold text-white ring-4 ring-white">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-indigo-950">{s.title}</div>
                    <div className="text-[13px] text-slate-500">{s.text}</div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}