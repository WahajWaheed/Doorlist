import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearAuthError,
  registerUser,
  selectAuthError,
  selectAuthStatus,
} from '../features/auth/authSlice';
import { pushToast } from '../features/ui/uiSlice';
import { validateRegister } from '../utils/validators';
import FormField from '../components/FormField';
import AuthShell from '../components/AuthShell';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useSelector(selectAuthStatus);
  const serverError = useSelector(selectAuthError);

  const [values, setValues] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const from = location.state?.from;
  const destination = from ? `${from.pathname}${from.search || ''}` : '/events';

  useEffect(() => {
    dispatch(clearAuthError());
    return () => dispatch(clearAuthError());
  }, [dispatch]);

  const errors = validateRegister(values);
  const show = (name) => (touched[name] || submitted) && errors[name];

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  const handleBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;

    const { name, email, password } = values;
    const result = await dispatch(registerUser({ name, email, password }));
    if (registerUser.fulfilled.match(result)) {
      dispatch(pushToast({ type: 'success', message: `Account created. Welcome, ${name.trim().split(' ')[0]}.` }));
      navigate(destination, { replace: true });
    }
  };

  return (
    <AuthShell
      eyebrow="Create account"
      title="Put your name on the list."
      aside="One account keeps every event you've claimed in a single place."
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {serverError && (
          <p className="auth-form__error" role="alert">
            {serverError}
          </p>
        )}

        <FormField
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Ayesha Khan"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={show('name')}
        />
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
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          value={values.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={show('password')}
        />
        <FormField
          label="Confirm password"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={handleChange}
          onBlur={handleBlur}
          error={show('confirm')}
        />

        <button type="submit" className="btn btn--primary btn--block" disabled={status === 'loading'}>
          {status === 'loading' ? 'Creating account...' : 'Create account'}
        </button>

        <p className="auth-form__switch">
          Already have an account?{' '}
          <Link to="/login" state={location.state}>
            Log in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
