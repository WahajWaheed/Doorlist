import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import {
  cancelRegistration,
  registerForEvent,
  selectIsRegistered,
} from '../features/registrations/registrationsSlice';
import { hasEnded } from '../utils/dates';
import ConfirmDialog from './ConfirmDialog';
import { CheckIcon } from './Icons';
import './RegisterButton.css';

// Everything about "can I register for this event?" in one place:
// logged out, already registered, finished, cancelled, or free to register.
export default function RegisterButton({ event }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser);
  const registered = useSelector(selectIsRegistered(event.id));
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleRegister = async () => {
    setBusy(true);
    await dispatch(registerForEvent(event));
    setBusy(false);
  };

  const handleCancel = async () => {
    setBusy(true);
    await dispatch(cancelRegistration(event.id));
    setBusy(false);
    setConfirming(false);
  };

  if (registered) {
    return (
      <div className="register">
        <p className="register__done">
          <CheckIcon /> You're on the list
        </p>
        {!hasEnded(event) && (
          <button type="button" className="btn btn--danger btn--block" onClick={() => setConfirming(true)}>
            Cancel registration
          </button>
        )}
        <ConfirmDialog
          open={confirming}
          title="Cancel your registration?"
          confirmLabel="Yes, cancel it"
          busy={busy}
          onConfirm={handleCancel}
          onCancel={() => setConfirming(false)}
        >
          <p>
            You'll be removed from the list for <strong>{event.name}</strong>. You can register again
            any time before it happens.
          </p>
        </ConfirmDialog>
      </div>
    );
  }

  if (event.status === 'cancelled') {
    return (
      <button type="button" className="btn btn--primary btn--block" disabled>
        Event cancelled
      </button>
    );
  }

  if (hasEnded(event)) {
    return (
      <button type="button" className="btn btn--primary btn--block" disabled>
        This event has finished
      </button>
    );
  }

  if (!user) {
    return (
      <div className="register">
        <Link to="/login" state={{ from: location }} className="btn btn--primary btn--block">
          Log in to register
        </Link>
        <p className="register__hint">
          No account yet?{' '}
          <Link to="/register" state={{ from: location }}>
            Create one
          </Link>
        </p>
      </div>
    );
  }

  return (
    <button type="button" className="btn btn--primary btn--block" onClick={handleRegister} disabled={busy}>
      {busy ? 'Saving your spot...' : 'Register for this event'}
    </button>
  );
}
