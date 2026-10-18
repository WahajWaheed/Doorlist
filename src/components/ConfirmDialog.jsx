import { useEffect, useRef } from 'react';
import './overlays.css';

// Built on the native <dialog> element, so focus trapping, Escape and the
// backdrop come from the browser instead of hand-rolled code.
export default function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Keep it',
  busy = false,
  onConfirm,
  onCancel,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="dialog"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onCancel(); // click on the backdrop
      }}
    >
      <div className="dialog__body">
        <h2>{title}</h2>
        <div className="dialog__text">{children}</div>
        <div className="dialog__actions">
          <button type="button" className="btn btn--outline" onClick={onCancel} autoFocus>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm} disabled={busy}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
