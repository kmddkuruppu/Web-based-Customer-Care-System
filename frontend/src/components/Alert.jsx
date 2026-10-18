export default function Alert({ type = 'danger', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">×</button>
      )}
    </div>
  );
}
