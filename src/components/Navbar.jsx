import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectUser } from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import { CloseIcon, MenuIcon } from './Icons';
import './Navbar.css';

const linkClass = ({ isActive }) => `nav__link${isActive ? ' is-active' : ''}`;

function initialsOf(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Navbar() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  // close the mobile menu whenever the route changes
  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(pushToast({ type: 'info', message: 'You have been logged out.' }));
    navigate('/');
  };

  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link to="/" className="nav__brand">
          <span className="nav__mark" aria-hidden="true" />
          Doorlist
        </Link>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="primary-nav"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          {open ? <CloseIcon width={22} height={22} /> : <MenuIcon width={22} height={22} />}
        </button>

        <nav id="primary-nav" className={`nav__menu${open ? ' is-open' : ''}`} aria-label="Primary">
          <div className="nav__links">
            <NavLink to="/events" className={linkClass}>
              Discover
            </NavLink>
            <NavLink to="/categories" className={linkClass}>
              Categories
            </NavLink>
            {user && (
              <NavLink to="/my-events" className={linkClass}>
                My events
              </NavLink>
            )}
          </div>

          <div className="nav__account">
            {user ? (
              <>
                <span className="nav__user" title={user.email}>
                  <span className="nav__avatar" aria-hidden="true">
                    {initialsOf(user.name)}
                  </span>
                  {user.name.split(' ')[0]}
                </span>
                <button type="button" className="btn btn--outline btn--sm" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn--ghost btn--sm">
                  Log in
                </Link>
                <Link to="/register" className="btn btn--primary btn--sm">
                  Join the list
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
