import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__brand">Doorlist</p>
          <p className="footer__note">
            Event listings come live from the{' '}
            <a href="https://developer.ticketmaster.com/" target="_blank" rel="noopener noreferrer">
              Ticketmaster Discovery API
            </a>
            . Registrations are stored in your browser only.
          </p>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <Link to="/events">Discover</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/my-events">My events</Link>
        </nav>
      </div>
    </footer>
  );
}
