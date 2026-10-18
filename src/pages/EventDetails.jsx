import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEventById,
  selectEventById,
  selectEventError,
  selectEventStatus,
} from '../features/events/eventsSlice';
import { hasEnded } from '../utils/dates';
import {
  formatLocation,
  formatLongDate,
  formatPrice,
  formatStamp,
  formatTime,
} from '../utils/format';
import ErrorState from '../components/ErrorState';
import RegisterButton from '../components/RegisterButton';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, ExternalIcon, PinIcon } from '../components/Icons';
import './EventDetails.css';
import '../components/states.css';

function DetailSkeleton() {
  return (
    <div className="container" aria-busy="true" aria-label="Loading event">
      <div className="skeleton" style={{ height: '1rem', width: '8rem', marginBottom: '1.5rem' }} />
      <div className="detail__grid">
        <div>
          <div className="skeleton" style={{ aspectRatio: '16 / 9' }} />
          <div className="skeleton" style={{ height: '3rem', width: '70%', marginTop: '1.5rem' }} />
        </div>
        <div className="skeleton" style={{ height: '20rem' }} />
      </div>
    </div>
  );
}

const STATUS_NOTES = {
  cancelled: 'This event has been cancelled.',
  postponed: 'This event has been postponed. Check Ticketmaster for the new date.',
  rescheduled: 'This event has been rescheduled. The date shown is the new one.',
};

export default function EventDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const event = useSelector(selectEventById(id));
  const status = useSelector(selectEventStatus(id));
  const error = useSelector(selectEventError(id));

  useEffect(() => {
    const request = dispatch(fetchEventById(id));
    return () => request.abort?.();
  }, [dispatch, id]);

  const back = (
    <Link to="/events" className="detail__back">
      <ArrowLeftIcon width={16} height={16} /> All events
    </Link>
  );

  if (!event) {
    if (status === 'failed') {
      return (
        <div className="page">
          <div className="container">
            {back}
            <ErrorState
              error={error}
              onRetry={() => dispatch(fetchEventById(id))}
            />
          </div>
        </div>
      );
    }
    return (
      <div className="page">
        <DetailSkeleton />
      </div>
    );
  }

  const ended = hasEnded(event);
  const location = formatLocation(event.venue);
  const price = formatPrice(event.price);
  const statusNote = STATUS_NOTES[event.status];
  const mapQuery = event.venue.lat && event.venue.lng
    ? `${event.venue.lat},${event.venue.lng}`
    : [event.venue.name, event.venue.address, location].filter(Boolean).join(' ');

  const facts = [
    price && ['Tickets from', price],
    event.promoter && ['Promoter', event.promoter],
    event.salesStart && ['On sale since', formatStamp(event.salesStart)],
    event.ticketLimit && ['Ticket limit', event.ticketLimit],
    event.ageNote && ['Age', event.ageNote],
    event.accessibility && ['Accessibility', event.accessibility],
  ].filter(Boolean);

  return (
    <div className="page">
      <article className="container">
        {back}

        <div className="detail__grid">
          <div className="detail__main">
            <div className="detail__image">
              {event.imageLarge || event.image ? (
                <img src={event.imageLarge || event.image} alt="" />
              ) : (
                <span>{event.name[0]}</span>
              )}
            </div>

            <header className="detail__head">
              <ul className="detail__tags">
                {event.category && <li className="detail__tag">{event.category}</li>}
                {event.genre && <li className="detail__tag">{event.genre}</li>}
                {event.subGenre && <li className="detail__tag">{event.subGenre}</li>}
                {ended && <li className="detail__tag detail__tag--muted">Finished</li>}
              </ul>
              <h1>{event.name}</h1>
              {statusNote && <p className="detail__status">{statusNote}</p>}
            </header>

            <section className="detail__section">
              <h2>About this event</h2>
              {event.info || event.pleaseNote ? (
                <>
                  {event.info && <p>{event.info}</p>}
                  {event.pleaseNote && (
                    <p className="detail__note">
                      <span className="label">Please note</span>
                      {event.pleaseNote}
                    </p>
                  )}
                </>
              ) : (
                <p className="detail__muted">
                  The organiser hasn't added a description yet. The full details are on Ticketmaster.
                </p>
              )}
            </section>

            {event.attractions.length > 0 && (
              <section className="detail__section">
                <h2>On the bill</h2>
                <ul className="detail__acts">
                  {event.attractions.map((a) => (
                    <li key={a.id}>
                      {a.image && <img src={a.image} alt="" loading="lazy" />}
                      <span>{a.name}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {facts.length > 0 && (
              <section className="detail__section">
                <h2>Good to know</h2>
                <dl className="detail__facts">
                  {facts.map(([term, value]) => (
                    <div key={term}>
                      <dt className="label">{term}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {event.seatmap && (
              <section className="detail__section">
                <h2>Seat map</h2>
                <img className="detail__seatmap" src={event.seatmap} alt={`Seating map for ${event.venue.name}`} loading="lazy" />
              </section>
            )}
          </div>

          <aside className="detail__aside" aria-label="Event summary and registration">
            <div className="stubcard">
              <dl>
                <div>
                  <dt className="label">
                    <CalendarIcon width={14} height={14} /> Date
                  </dt>
                  <dd>{formatLongDate(event.localDate)}</dd>
                </div>
                <div>
                  <dt className="label">
                    <ClockIcon width={14} height={14} /> Time
                  </dt>
                  <dd>{event.timeTBA ? 'Time to be announced' : formatTime(event.localTime)}</dd>
                </div>
                <div>
                  <dt className="label">
                    <PinIcon width={14} height={14} /> Venue
                  </dt>
                  <dd>
                    {event.venue.name || 'Venue to be announced'}
                    {(event.venue.address || location) && (
                      <span className="stubcard__sub">
                        {[event.venue.address, location].filter(Boolean).join(', ')}
                      </span>
                    )}
                    {mapQuery && (
                      <a
                        className="stubcard__map"
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in maps <ExternalIcon width={13} height={13} />
                      </a>
                    )}
                  </dd>
                </div>
              </dl>

              <div className="stubcard__perf" aria-hidden="true" />

              <div className="stubcard__actions">
                <RegisterButton event={event} />
                {event.url && (
                  <a
                    className="btn btn--outline btn--block"
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buy tickets on Ticketmaster <ExternalIcon width={15} height={15} />
                  </a>
                )}
                <p className="stubcard__fine">
                  Registering saves the event to your list here. Tickets are sold by Ticketmaster.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </article>
    </div>
  );
}
