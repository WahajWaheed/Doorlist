import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="page">
      <div className="container">
        <div className="empty">
          <p className="label">404</p>
          <h3>This page isn't on the bill</h3>
          <p>The link may be old, or the page was never there.</p>
          <Link to="/events" className="btn btn--primary">
            Back to events
          </Link>
        </div>
      </div>
    </div>
  );
}
