// "Are you sure?" dialog for destructive actions (cancel a reservation, delete a station). OWNER: PM.
// Props: open, title, message, confirmLabel, tone ('danger' | 'primary'), loading, onConfirm, onCancel
// Example:
//   <ConfirmDialog open={Boolean(toDelete)} title="Delete station?" message="This cannot be undone."
//                  confirmLabel="Delete" loading={busy} onConfirm={doDelete} onCancel={() => setToDelete(null)} />
import Button from './Button.jsx';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Keep it', tone = 'danger', loading = false, onConfirm, onCancel }) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={loading ? undefined : onCancel}
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p>{message}</p>
    </Modal>
  );
}
