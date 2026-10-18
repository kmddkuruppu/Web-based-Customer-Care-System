import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import { categoryService } from '../../services/categoryService';
import { useFetch } from '../../utils/useFetch';
import { asList, errMsg, ticketCode } from '../../utils/helpers';
import { PRIORITIES } from '../../utils/constants';
import Alert from '../../components/Alert';
import Icon from '../../components/Icon';

const INITIAL = { title: '', category: '', description: '', priority: 'MEDIUM' };

/* ---------------------------------------------------------------------
   Animations are embedded here, so no tailwind.config changes are needed.
   All motion is disabled for people who prefer reduced motion.
   --------------------------------------------------------------------- */
const CSS = `
@keyframes sc-rise   { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
@keyframes sc-slide  { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
@keyframes sc-float  { 0%,100% { transform: translateY(0) rotate(-4deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
@keyframes sc-flow   { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
@keyframes sc-drift  { 0%,100% { transform: translate(0,0); } 50% { transform: translate(18px,14px); } }
@keyframes sc-shake  { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
@keyframes sc-pop    { 0% { transform: scale(1); } 45% { transform: scale(1.09); } 100% { transform: scale(1); } }
@keyframes sc-trail  { to { stroke-dashoffset: -48; } }
@keyframes sc-sweep  { 0% { transform: translateX(-130%); } 55%,100% { transform: translateX(130%); } }
@keyframes sc-draw   { from { stroke-dashoffset: 70; } to { stroke-dashoffset: 0; } }
@keyframes sc-ring   { 0% { transform: scale(.6); opacity: .6; } 100% { transform: scale(2.2); opacity: 0; } }
@keyframes sc-burst  { 0% { opacity: 1; transform: translate(-50%,-50%) scale(.4); }
                       100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) rotate(var(--rot)) scale(1); } }
@keyframes sc-flip   { from { opacity: 0; transform: rotateX(90deg) translateY(8px); } to { opacity: 1; transform: none; } }
@keyframes sc-load   { 0% { transform: translateX(-100%); } 100% { transform: translateX(260%); } }

.sc-rise  { animation: sc-rise .7s cubic-bezier(.2,.8,.2,1) both; }
.sc-slide { animation: sc-slide .3s ease-out both; }
.sc-float { animation: sc-float 5s ease-in-out infinite; }
.sc-flow  { background-size: 220% 220%; animation: sc-flow 16s ease-in-out infinite; }
.sc-drift { animation: sc-drift 13s ease-in-out infinite; }
.sc-shake { animation: sc-shake .45s ease-in-out; }
.sc-pop   { animation: sc-pop .35s ease-out; }
.sc-trail { stroke-dasharray: 6 8; animation: sc-trail 1.6s linear infinite; }
.sc-draw  { stroke-dasharray: 70; animation: sc-draw .7s .35s ease-out both; }
.sc-ring  { animation: sc-ring 1.8s ease-out infinite; }
.sc-burst { animation: sc-burst 1.1s cubic-bezier(.15,.8,.3,1) both; }
.sc-flip  { animation: sc-flip .5s cubic-bezier(.2,.8,.2,1) both; }
.sc-load  { animation: sc-load 1.1s ease-in-out infinite; }

.sc-cta { position: relative; overflow: hidden; }
.sc-cta::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,.45) 50%, transparent 70%);
  transform: translateX(-130%); animation: sc-sweep 3s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .sc *, .sc *::before, .sc *::after { animation: none !important; transition: none !important; }
}
`;

/* ------------------------------ constants ------------------------------ */

/* Full class names so Tailwind can detect them at build time. */
const PRIORITY_STYLE = {
  LOW: { on: 'border-emerald-400 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100', dot: 'bg-emerald-500' },
  MEDIUM: { on: 'border-blue-400 bg-blue-50 text-blue-700 ring-4 ring-blue-100', dot: 'bg-blue-500' },
  HIGH: { on: 'border-orange-400 bg-orange-50 text-orange-700 ring-4 ring-orange-100', dot: 'bg-orange-500' },
  URGENT: { on: 'border-rose-400 bg-rose-50 text-rose-700 ring-4 ring-rose-100', dot: 'bg-rose-500' },
};
const FALLBACK_STYLE = { on: 'border-indigo-400 bg-indigo-50 text-indigo-700 ring-4 ring-indigo-100', dot: 'bg-indigo-500' };

const CONFETTI_COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#10b981', '#f59e0b', '#38bdf8'];
const PARTICLES = Array.from({ length: 20 }, (_, i) => {
  const a = (i / 20) * Math.PI * 2;
  const d = 90 + (i % 3) * 38;
  return {
    dx: Math.round(Math.cos(a) * d),
    dy: Math.round(Math.sin(a) * d),
    rot: (i * 53) % 360,
    c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    s: 7 + (i % 3) * 3,
    round: i % 2 === 0,
  };
});

const TIPS = [
  'Be specific: what happened, and when.',
  'Add a screenshot or document if you have one.',
  'Pick the priority that matches how urgent it is for you.',
];

const inputBase =
  'w-full rounded-xl border-[1.5px] bg-[#fbfbff] px-3.5 py-3 text-[15px] text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-indigo-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/15';

const fileSize = (b) => (b >= 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/* ------------------------------ small parts ------------------------------ */

function Field({ label, hint, error, shake, onShaken, delay = 0, children }) {
  return (
    <div
      className={`sc-rise mb-5 ${shake ? 'sc-shake' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
      onAnimationEnd={(e) => e.animationName === 'sc-shake' && onShaken && onShaken()}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-[13px] font-bold text-indigo-950">{label}</label>
        {hint}
      </div>
      {children}
      {error && (
        <p className="sc-slide mb-0 mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-600">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-rose-100 text-[10px] font-extrabold">!</span>
          {error}
        </p>
      )}
    </div>
  );
}

/* underline that draws itself while the field has focus */
function FocusLine() {
  return (
    <span className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 transition-transform duration-500 group-focus-within:scale-x-100" />
  );
}

function Counter({ len, min }) {
  const ok = len >= min;
  return (
    <span className={`flex items-center gap-1 text-xs font-semibold transition-colors ${ok ? 'text-emerald-600' : 'text-slate-400'}`}>
      {ok ? <Icon name="check" size={13} /> : null}
      {len}/{min}+
    </span>
  );
}

function PaperPlane() {
  return (
    <svg viewBox="0 0 220 150" className="h-full w-full" aria-hidden="true">
      <path className="sc-trail" d="M8 130C50 130 60 60 110 70S150 40 170 34" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="3" strokeLinecap="round" />
      <g className="sc-float" style={{ transformOrigin: '176px 36px', transformBox: 'fill-box' }}>
        <path d="M150 38l62-26-22 62-18-22-22 14z" fill="#fff" />
        <path d="M172 52l18-30-40 26z" fill="#c7d2fe" />
        <path d="M172 52l-4 24 14-14z" fill="#a5b4fc" />
      </g>
    </svg>
  );
}

function PriorityPicker({ value, onChange }) {
  return (
    <div role="group" aria-label="Priority" className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {PRIORITIES.map((p) => {
        const st = PRIORITY_STYLE[p] || FALLBACK_STYLE;
        const on = value === p;
        return (
          <button
            key={p}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(p)}
            className={`flex items-center justify-center gap-2 rounded-xl border-[1.5px] px-3 py-2.5 text-[13px] font-bold capitalize transition duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 ${
              on ? `${st.on} sc-pop` : 'border-[#dfe3f0] bg-white text-slate-500 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700'
            }`}
          >
            <span className={`h-2 w-2 rounded-full transition-transform ${on ? `${st.dot} scale-125` : 'bg-slate-300'}`} />
            {String(p).toLowerCase()}
          </button>
        );
      })}
    </div>
  );
}

function DropZone({ file, onFile, error }) {
  const [drag, setDrag] = useState(false);
  if (file) {
    return (
      <div className="sc-slide flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-3.5">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white">
          <Icon name="check" size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-indigo-950">{file.name}</div>
          <div className={`text-xs ${error ? 'font-semibold text-rose-600' : 'text-slate-500'}`}>{fileSize(file.size)}</div>
        </div>
        <button
          type="button"
          onClick={() => onFile(null)}
          aria-label="Remove attachment"
          className="grid h-8 w-8 place-items-center rounded-lg text-lg font-bold text-slate-500 transition hover:bg-white hover:text-rose-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
        >
          ×
        </button>
      </div>
    );
  }
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        onFile(e.dataTransfer.files[0] || null);
      }}
      className={`group flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition duration-200 ${
        drag ? 'scale-[1.02] border-indigo-500 bg-indigo-50' : 'border-[#d5d9f0] bg-[#fbfbff] hover:border-indigo-300 hover:bg-indigo-50/40'
      }`}
    >
      <span className={`grid h-11 w-11 place-items-center rounded-full bg-indigo-100 text-indigo-600 transition duration-300 ${drag ? '-translate-y-1.5' : 'group-hover:-translate-y-1'}`}>
        <Icon name="plus" size={20} />
      </span>
      <span className="text-sm font-bold text-indigo-950">Drop a file here, or click to browse</span>
      <span className="text-xs text-slate-500">Optional, up to 5 MB</span>
      <input type="file" className="sr-only" onChange={(e) => onFile(e.target.files[0] || null)} />
    </label>
  );
}

/* ------------------------------ success ------------------------------ */

function Success({ created, onAgain }) {
  const code = String(ticketCode(created));
  return (
    <div className="sc">
      <style>{CSS}</style>
      <div className="sc-rise relative mx-auto mt-6 max-w-xl overflow-hidden rounded-3xl border border-[#e6e8f2] bg-white px-8 pb-9 pt-10 text-center shadow-2xl shadow-indigo-500/15">
        <div className="sc-flow absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500" />

        <div className="relative mx-auto h-20 w-20">
          <span className="sc-ring absolute inset-0 rounded-full bg-emerald-400/40" />
          <span className="sc-ring absolute inset-0 rounded-full bg-emerald-400/30" style={{ animationDelay: '.6s' }} />
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="sc-burst absolute left-1/2 top-1/2"
              style={{
                '--dx': `${p.dx}px`,
                '--dy': `${p.dy}px`,
                '--rot': `${p.rot}deg`,
                width: p.s,
                height: p.s,
                background: p.c,
                borderRadius: p.round ? '999px' : '2px',
                animationDelay: `${0.25 + (i % 5) * 0.03}s`,
              }}
            />
          ))}
          <span className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/40">
            <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
              <path className="sc-draw" d="M10 21l7 7 14-16" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        <h2 className="sc-rise m-0 mt-6 text-2xl font-extrabold text-indigo-950" style={{ animationDelay: '300ms' }}>
          Complaint submitted
        </h2>
        <p className="sc-rise mb-0 mt-1.5 text-sm text-slate-500" style={{ animationDelay: '380ms' }}>
          Your ticket ID is
        </p>

        <div
          className="mx-auto mt-3 inline-block rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50 px-7 py-3 text-3xl font-extrabold tracking-wider text-indigo-700"
          style={{ perspective: 600 }}
          aria-label={code}
        >
          {code.split('').map((ch, i) => (
            <span key={i} aria-hidden="true" className="sc-flip inline-block" style={{ animationDelay: `${500 + i * 70}ms` }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </div>

        <p className="sc-rise mb-0 mt-3 text-sm text-slate-500" style={{ animationDelay: '900ms' }}>
          Keep this ID to track your complaint.
        </p>

        <div className="sc-rise mt-7 flex flex-wrap justify-center gap-3" style={{ animationDelay: '1000ms' }}>
          {created.id && (
            <Link
              to={`/customer/tickets/${created.id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5 hover:no-underline focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
            >
              View ticket
            </Link>
          )}
          <button
            type="button"
            onClick={onAgain}
            className="inline-flex items-center gap-2 rounded-xl border border-[#dcdff0] bg-white px-5 py-3 text-sm font-bold text-indigo-950 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200"
          >
            Submit another
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ page ------------------------------ */

export default function SubmitComplaint() {
  const { data: catData } = useFetch(() => categoryService.getAll(), []);
  const categories = asList(catData).filter((c) => c.active !== false);
  const [form, setForm] = useState(INITIAL);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const unshake = (k) => () => setShake((s) => ({ ...s, [k]: false }));

  const titleOk = form.title.trim().length >= 5;
  const catOk = !!form.category;
  const descOk = form.description.trim().length >= 10;
  const ready = [titleOk, catOk, descOk].filter(Boolean).length;

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 5) e.title = 'Title must be at least 5 characters';
    if (!form.category) e.category = 'Please select a category';
    if (form.description.trim().length < 10) e.description = 'Description must be at least 10 characters';
    if (file && file.size > 5 * 1024 * 1024) e.file = 'Attachment must be smaller than 5 MB';
    setErrors(e);
    setShake(Object.fromEntries(Object.keys(e).map((k) => [k, true])));
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('attachment', file);
      const res = await ticketService.create(fd);
      setCreated(res.data);
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setLoading(false);
    }
  };

  const tilt = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 7).toFixed(2)}deg`);
    e.currentTarget.style.setProperty('--rx', `${(-((e.clientY - r.top) / r.height - 0.5) * 7).toFixed(2)}deg`);
  };
  const untilt = (e) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  if (created) {
    return (
      <Success
        created={created}
        onAgain={() => {
          setCreated(null);
          setForm(INITIAL);
          setFile(null);
          setErrors({});
        }}
      />
    );
  }

  const pStyle = PRIORITY_STYLE[form.priority] || FALLBACK_STYLE;

  return (
    <div className="sc flex flex-col gap-6">
      <style>{CSS}</style>

      {/* ============================ header ============================ */}
      <header className="sc-flow sc-rise relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-500 to-fuchsia-500 px-6 py-8 text-white shadow-2xl shadow-indigo-500/30 sm:px-10">
        <span className="sc-drift absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-white/10" />
        <span className="sc-drift absolute -bottom-20 left-1/3 -z-10 h-40 w-40 rounded-full bg-white/10" style={{ animationDelay: '-6s' }} />
        <div className="flex items-center justify-between gap-6">
          <div>
            <h1 className="m-0 text-3xl font-extrabold tracking-tight text-white">Submit a complaint</h1>
            <p className="mb-0 mt-2 max-w-md text-[15px] leading-relaxed text-white/90">
              Tell us what went wrong. You can follow every update from your dashboard.
            </p>
          </div>
          <div className="hidden h-28 w-44 flex-none sm:block">
            <PaperPlane />
          </div>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* ============================ form ============================ */}
        <form
          onSubmit={submit}
          noValidate
          className="rounded-2xl border border-[#e6e8f2] bg-white p-5 shadow-sm sm:p-7"
        >
          <Alert message={error} onClose={() => setError('')} />

          {/* progress meter */}
          <div className="sc-rise mb-6" style={{ animationDelay: '120ms' }}>
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span className="text-indigo-950">Required details</span>
              <span className={ready === 3 ? 'text-emerald-600' : 'text-slate-500'}>
                {ready === 3 ? 'Ready to submit' : `${ready} of 3 ready`}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  ready === 3 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-indigo-500 to-fuchsia-500'
                }`}
                style={{ width: `${(ready / 3) * 100}%` }}
              />
            </div>
          </div>

          <Field
            label="Complaint title"
            error={errors.title}
            shake={shake.title}
            onShaken={unshake('title')}
            delay={200}
            hint={<Counter len={form.title.trim().length} min={5} />}
          >
            <div className="group relative">
              <input
                className={`${inputBase} ${errors.title ? 'border-rose-400 bg-rose-50' : 'border-[#dfe3f0]'}`}
                value={form.title}
                onChange={set('title')}
                placeholder="e.g. Payment charged twice"
              />
              <FocusLine />
            </div>
          </Field>

          <Field label="Category" error={errors.category} shake={shake.category} onShaken={unshake('category')} delay={280}>
            <div className="group relative">
              <select
                className={`${inputBase} cursor-pointer appearance-none pr-10 ${errors.category ? 'border-rose-400 bg-rose-50' : 'border-[#dfe3f0]'}`}
                value={form.category}
                onChange={set('category')}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-transform duration-300 group-focus-within:rotate-180 group-focus-within:text-indigo-500" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <FocusLine />
            </div>
          </Field>

          <Field label="Priority" delay={360}>
            <PriorityPicker value={form.priority} onChange={(p) => setForm({ ...form, priority: p })} />
          </Field>

          <Field
            label="Description"
            error={errors.description}
            shake={shake.description}
            onShaken={unshake('description')}
            delay={440}
            hint={<Counter len={form.description.trim().length} min={10} />}
          >
            <div className="group relative">
              <textarea
                rows={6}
                className={`${inputBase} resize-y ${errors.description ? 'border-rose-400 bg-rose-50' : 'border-[#dfe3f0]'}`}
                value={form.description}
                onChange={set('description')}
                placeholder="What happened, when, and what would you like us to do?"
              />
              <FocusLine />
            </div>
          </Field>

          <Field label="Attachment (optional)" error={errors.file} shake={shake.file} onShaken={unshake('file')} delay={520}>
            <DropZone file={file} onFile={setFile} error={errors.file} />
          </Field>

          <div className="sc-rise flex flex-wrap items-center justify-between gap-3 border-t border-[#eef0f8] pt-5" style={{ animationDelay: '600ms' }}>
            <p className="m-0 text-xs text-slate-500">You will get a ticket ID as soon as it is submitted.</p>
            <button
              disabled={loading}
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-70 ${
                ready === 3 && !loading ? 'sc-cta' : ''
              }`}
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".3" strokeWidth="3" />
                    <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit complaint'
              )}
            </button>
          </div>
        </form>

        {/* ============================ side ============================ */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="sc-rise" style={{ animationDelay: '300ms' }}>
            <div
              onMouseMove={tilt}
              onMouseLeave={untilt}
              className="relative overflow-hidden rounded-2xl border border-[#e6e8f2] bg-white p-5 shadow-xl shadow-indigo-500/10 transition-transform duration-200 ease-out"
              style={{ transform: 'perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))' }}
            >
              {loading && (
                <span className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-indigo-100">
                  <span className="sc-load block h-full w-2/5 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500" />
                </span>
              )}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Live preview</span>
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
              </div>

              {form.title.trim() ? (
                <h3 className="m-0 break-words text-lg font-extrabold leading-snug text-indigo-950">{form.title}</h3>
              ) : (
                <div className="space-y-2" aria-hidden="true">
                  <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-4 w-3/5 animate-pulse rounded-full bg-slate-100" />
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  {form.category || 'No category yet'}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold capitalize transition-colors ${pStyle.on.replace(/ring-\S+/g, '')}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${pStyle.dot}`} />
                  {String(form.priority).toLowerCase()}
                </span>
              </div>

              {form.description.trim() ? (
                <p className="mb-0 mt-4 line-clamp-4 break-words text-sm leading-relaxed text-slate-600">{form.description}</p>
              ) : (
                <div className="mt-4 space-y-2" aria-hidden="true">
                  <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-11/12 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-[#eef0f8] pt-4 text-xs text-slate-500">
                <span className="badge badge-OPEN">
                  <span className="badge-dot" />
                  open
                </span>
                {file ? <span className="sc-slide max-w-[50%] truncate font-semibold text-indigo-700">{file.name}</span> : <span>No attachment</span>}
              </div>
            </div>
          </div>

          <section className="sc-rise rounded-2xl border border-[#e6e8f2] bg-white p-5 shadow-sm" style={{ animationDelay: '450ms' }}>
            <h2 className="m-0 text-base font-extrabold text-indigo-950">Tips for a faster reply</h2>
            <ul className="m-0 mt-3 list-none space-y-2.5 p-0">
              {TIPS.map((t) => (
                <li key={t} className="flex gap-2.5 text-[13.5px] leading-snug text-slate-600">
                  <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-indigo-100 text-indigo-600">
                    <Icon name="check" size={12} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}