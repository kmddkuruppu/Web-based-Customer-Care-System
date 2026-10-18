export default function FormField({ label, error, children }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      {children}
      {error && <small className="field-error">{error}</small>}
    </div>
  );
}
