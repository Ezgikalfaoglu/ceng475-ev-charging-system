// Spinner shown while data loads. OWNER: PM.
export default function LoadingState({ label = 'Loading...' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" />
      <p>{label}</p>
    </div>
  );
}
