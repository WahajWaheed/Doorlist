import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import {
  cancelRegistration,
  selectUserRegistrations,
} from '../features/registrations/registrationsSlice';
import { getEventStart, hasEnded } from '../utils/dates';
import { dateParts, formatLocation, formatStamp, formatTime } from '../utils/format';
import ConfirmDialog from '../components/ConfirmDialog';
import './MyEvents.css';

function RegistrationRow({ registration, completed, onCancel }) {
  const { event } = registration;
  const { month, day, weekday } = dateParts(event.localDate);
  const place = [event.venue?.name, formatLocation(event.venue)].filter(Boolean).join(' - ');

  return (
    <li className={`reg${completed ? ' is-done' : ''}`}>
      <div className="reg__stub" aria-hidden="true">
        <span className="reg__month">{month}</span>
        <span className="reg__day">{day}</span>
        <span className="reg__weekday">{weekday}</span>
      </div>

      <div className="reg__main">
        <h3>
          <Link to={`/events/${event.id}`}>{event.name}</Link>
        </h3>
        <p className="reg__meta">
          {event.localTime ? formatTime(event.localTime) : 'Time TBA'}
          {place && <> &middot; {place}</>}
        </p>
        <p className="reg__stamp label">Registered {formatStamp(registration.registeredAt)}</p>
      </div>

      <div className="reg__actions">
        {completed ? (
          <span className="reg__badge">Completed</span>
        ) : event.status === 'cancelled' ? (
          <span className="reg__badge reg__badge--warn">Event cancelled</span>
        ) : null}
        <Link to={`/events/${event.id}`} className="btn btn--outline btn--sm">
          View
        </Link>
        {!completed && (
          <button type="button" className="btn btn--danger btn--sm" onClick={() => onCancel(registration)}>
            Cancel
          </button>
        )}
      </div>
    </li>
  );
}

export default function MyEvents() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const registrations = useSelector(selectUserRegistrations);
  const [tab, setTab] = useState('upcoming');
  const [pending, setPending] = useState(null); // registration awaiting cancel confirmation
  const [busy, setBusy] = useState(false);

  // Upcoming vs completed is decided at render time from the event's date,
  // so an event moves to "Completed" by itself once it has passed.
  const { upcoming, completed } = useMemo(() => {
    const now = Date.now();
    const up = [];
    const done = [];
    registrations.forEach((r) => (hasEnded(r.event, now) ? done : up).push(r));
    up.sort((a, b) => getEventStart(a.event) - getEventStart(b.event));
    done.sort((a, b) => getEventStart(b.event) - getEventStart(a.event));
    return { upcoming: up, completed: done };
  }, [registrations]);

  const list = tab === 'upcoming' ? upcoming : completed;

  const confirmCancel = async () => {
    if (!pending) return;
    setBusy(true);
    await dispatch(cancelRegistration(pending.eventId));
    setBusy(false);
    setPending(null);
  };

  return (
    <div className="page">
      <div className="container my">
        <header className="my__head">
          <p className="label">{user?.name}</p>
          <h1>My events</h1>
          <p>
            {registrations.length === 0
              ? "Nothing here yet. Find something worth going to."
              : `${upcoming.length} coming up, ${completed.length} already done.`}
          </p>
        </header>

        <div className="my__tabs" role="tablist" aria-label="Registered events">
          {[
            ['upcoming', 'Upcoming', upcoming.length],
            ['completed', 'Completed', completed.length],
          ].map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-selected={tab === key}
              aria-controls="my-panel"
              className={`my__tab${tab === key ? ' is-active' : ''}`}
              onClick={() => setTab(key)}
            >
              {label} <span className="my__count">{count}</span>
            </button>
          ))}
        </div>

        <div id="my-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          {list.length > 0 ? (
            <ul className="my__list">
              {list.map((r) => (
                <RegistrationRow
                  key={r.id}
                  registration={r}
                  completed={tab === 'completed'}
                  onCancel={setPending}
                />
              ))}
            </ul>
          ) : (
            <div className="empty">
              <h3>{tab === 'upcoming' ? 'No upcoming events' : 'No completed events yet'}</h3>
              <p>
                {tab === 'upcoming'
                  ? "You haven't registered for anything that's still to come."
                  : "Events you've registered for will show up here once they've happened."}
              </p>
              {tab === 'upcoming' && (
                <Link to="/events" className="btn btn--primary">
                  Find events
                </Link>
              )}
            </div>
          )}
        </div>

        <ConfirmDialog
          open={Boolean(pending)}
          title="Cancel your registration?"
          confirmLabel="Yes, cancel it"
          busy={busy}
          onConfirm={confirmCancel}
          onCancel={() => setPending(null)}
        >
          <p>
            You'll be removed from the list for <strong>{pending?.event.name}</strong>.
          </p>
        </ConfirmDialog>
      </div>
    </div>
  );
}
