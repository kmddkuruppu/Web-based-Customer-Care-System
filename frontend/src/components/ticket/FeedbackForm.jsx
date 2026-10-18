import { useState } from 'react';

export default function FeedbackForm({ onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setError('Please select a rating from 1 to 5.');
    if (comment.trim().length < 3) return setError('Please enter a short comment.');
    setError('');
    setBusy(true);
    await onSubmit({ rating, comment: comment.trim() });
    setBusy(false);
  };

  return (
    <form className="card action-card" onSubmit={submit}>
      <h4>Rate Our Service</h4>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} className={n <= rating ? 'star on' : 'star'} onClick={() => setRating(n)}>★</button>
        ))}
      </div>
      <textarea className="input" rows={3} placeholder="Tell us about your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
      {error && <small className="field-error">{error}</small>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Submitting...' : 'Submit Feedback'}</button>
    </form>
  );
}
