import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', variant = 'danger', loading = false }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      {description && <p className="text-sm text-[#9ca3c4] mb-6">{description}</p>}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
