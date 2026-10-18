import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchClassifications,
  selectClassificationStatus,
  selectSegments,
} from '../features/events/eventsSlice';
import { ArrowRightIcon } from '../components/Icons';
import './Categories.css';
import '../components/states.css';

export default function Categories() {
  const dispatch = useDispatch();
  const segments = useSelector(selectSegments);
  const status = useSelector(selectClassificationStatus);

  useEffect(() => {
    dispatch(fetchClassifications());
  }, [dispatch]);

  return (
    <div className="page">
      <div className="container">
        <header className="cat-head">
          <p className="label">Categories</p>
          <h1>Pick your poison</h1>
          <p>
            Ticketmaster groups everything into broad categories, then genres. Jump in at either
            level.
          </p>
        </header>

        {status === 'loading' && segments.length === 0 && (
          <div className="cat-list" aria-busy="true">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton" style={{ height: '8rem' }} />
            ))}
          </div>
        )}

        <div className="cat-list">
          {segments.map((segment) => (
            <section key={segment.id} className="cat">
              <div className="cat__head">
                <h2>{segment.name}</h2>
                <Link to={`/events?segment=${segment.id}`} className="link-arrow">
                  All {segment.name.toLowerCase()} <ArrowRightIcon width={15} height={15} />
                </Link>
              </div>

              {segment.genres.length > 0 ? (
                <ul className="cat__genres">
                  {segment.genres.map((genre) => (
                    <li key={genre.id}>
                      <Link
                        className="chip"
                        to={`/events?segment=${segment.id}&genre=${genre.id}`}
                      >
                        {genre.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="cat__none">Browse everything in this category.</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
