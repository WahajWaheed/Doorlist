import { Link } from 'react-router-dom';
import { dateParts, formatLocation, formatTime } from '../utils/format';
import './EventCard.css';

const FLAGS = {
  cancelled: 'Cancelled',
  postponed: 'Postponed',
  rescheduled: 'Rescheduled',
};

export default function EventCard({ event }) {
  const { month, day, weekday } = dateParts(event.localDate);
  const place = [event.venue?.name, formatLocation(event.venue)].filter(Boolean).join(' - ');
  const flag = FLAGS[event.status];

  return (
    <article className="ev-card">
      <Link to={`/events/${event.id}`} className="ev-card__media" tabIndex={-1} aria-hidden="true">
        {event.image ? (
          <img src={event.image} alt="" loading="lazy" />
        ) : (
          <span className="ev-card__placeholder">{event.name?.[0] || '?'}</span>
        )}
        {event.category && <span className="ev-card__tag">{event.genre || event.category}</span>}
        {flag && <span className={`ev-card__flag ev-card__flag--${event.status}`}>{flag}</span>}
      </Link>

      <div className="ev-card__body">
        <div className="ev-card__stub" aria-hidden="true">
          <span className="ev-card__month">{month}</span>
          <span className="ev-card__day">{day}</span>
          <span className="ev-card__weekday">{weekday}</span>
        </div>
        <div className="ev-card__info">
          <h3>
            <Link to={`/events/${event.id}`}>{event.name}</Link>
          </h3>
          {place && <p className="ev-card__place">{place}</p>}
          <p className="ev-card__time">
            {event.localDate ? (
              <>
                <span className="sr-only">{`${weekday} ${month} ${day}, `}</span>
                {event.timeTBA ? 'Time TBA' : formatTime(event.localTime)}
              </>
            ) : (
              'Date to be announced'
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
