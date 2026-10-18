import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { dismissToast, selectToasts } from '../features/ui/uiSlice';
import { AlertIcon, CheckIcon, CloseIcon } from './Icons';
import './overlays.css';

function Toast({ toast }) {
  const dispatch = useDispatch();

  useEffect(() => {
    const timer = setTimeout(() => dispatch(dismissToast(toast.id)), 4800);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  return (
    <div className={`toast toast--${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <span className="toast__icon">
        {toast.type === 'success' ? <CheckIcon /> : toast.type === 'error' ? <AlertIcon /> : null}
      </span>
      <p>{toast.message}</p>
      <button
        type="button"
        className="toast__close"
        onClick={() => dispatch(dismissToast(toast.id))}
        aria-label="Dismiss notification"
      >
        <CloseIcon width={16} height={16} />
      </button>
    </div>
  );
}

export default function Toaster() {
  const toasts = useSelector(selectToasts);
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}
