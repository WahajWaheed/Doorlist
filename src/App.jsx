import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Toaster from './components/Toaster';
import { GuestRoute, ProtectedRoute } from './routes/ProtectedRoute';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Categories from './pages/Categories';
import MyEvents from './pages/MyEvents';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Navigating to a new page should start at the top, not mid-scroll.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/categories" element={<Categories />} />

          {/* only for logged-out visitors */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* only for logged-in users */}
          <Route element={<ProtectedRoute />}>
            <Route path="/my-events" element={<MyEvents />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </>
  );
}
