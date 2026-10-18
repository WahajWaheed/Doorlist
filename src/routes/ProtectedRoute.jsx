import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

// Only logged-in users get through; everyone else is sent to /login and
// remembered via `state.from` so we can bring them back afterwards.
export function ProtectedRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

// The mirror image: login/register make no sense once you're logged in.
export function GuestRoute() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from;
    return <Navigate to={from ? `${from.pathname}${from.search || ''}` : '/events'} replace />;
  }
  return <Outlet />;
}
