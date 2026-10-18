import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  loginUser,
  selectAuthError,
  selectAuthStatus,
} from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import { validateLogin } from '../utils/validators';
import FormField from '../components/FormField';
import AuthShell from '../components/AuthShell';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector(selectAuthStatus);
  const serverError = useSelector(selectAuthError);

  const [values, setValues] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // where to go afterwards: the page that sent us here, or the event list
  const from = location.state?.from;
  const destination = from ? `${from.pathname}${from.search || ''}` : '/events';

  useEffect(() => {
    dispatch(clearAuthError());
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const errors = validateLogin(values);
  const show = (name) => (touched[name] || submitted) && errors[name];

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;

    const result = await dispatch(loginUser(values));
    if (loginUser.fulfilled.match(result)) {
      dispatch(pushToast({ type: 'success', message: `Welcome back, ${result.payload.name.split(' ')[0]}.` }));
      navigate(destination, { replace: true });
    }
  };

  return (
    <AuthShell
      eyebrow="Log in"
      title="Good to see you again."
      aside="Your registrations are right where you left them."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {from && (
          <p className="auth-form__note">Log in to continue to the page you were looking at.</p>
        )}
        {serverError && (
          <p className="auth-form__error" role="alert">
            {serverError}
          </p>
        )}

        <FormField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={show('email')}
        />
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={show('password')}
        />

        <button type="submit" className="btn btn--primary btn--block" disabled={status === 'loading'}>
          {status === 'loading' ? 'Logging in...' : 'Log in'}
        </button>

        <p className="auth-form__switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}
