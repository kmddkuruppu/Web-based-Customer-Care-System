import { useState } from 'react';

export default function TextAction({
  title, placeholder, button, onSubmit, variant = 'primary', min = 3, rows = 3,
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (text.trim().length < min) {
      setError(`Please enter at least ${min} characters.`);
      return;
    }
    setError('');
    setBusy(true);
    const ok = await onSubmit(text.trim());
    setBusy(false);
    if (ok) setText('');
  };

  return (
    <form className="card action-card" onSubmit={submit}>
      <h4>{title}</h4>
      <textarea
        className="input"
        rows={rows}
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      {error && <small className="field-error">{error}</small>}
      <button className={`btn btn-${variant}`} disabled={busy}>{busy ? 'Saving...' : button}</button>
    </form>
  );
}
