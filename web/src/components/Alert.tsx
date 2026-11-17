export function Alert({ type, message }: { type: 'error' | 'success'; message: string | null }) {
  if (!message) return null;
  return (
    <div className={`alert alert-${type}`} role={type === 'error' ? 'alert' : 'status'}>
      {message}
    </div>
  );
}
