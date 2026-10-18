const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateRegister({ name, email, password, confirm }) {
  const errors = {};

  if (!name.trim()) errors.name = 'Tell us what to call you.';
  else if (name.trim().length < 2) errors.name = 'Your name needs at least 2 characters.';

  if (!email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL.test(email.trim())) errors.email = "That email address doesn't look right.";

  if (!password) errors.password = 'Choose a password.';
  else if (password.length < 8) errors.password = 'Use at least 8 characters.';
  else if (!/[A-Za-z]/.test(password) || !/\d/.test(password))
    errors.password = 'Mix letters with at least one number.';

  if (!confirm) errors.confirm = 'Type the password again to confirm it.';
  else if (confirm !== password) errors.confirm = "Those passwords don't match.";

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = 'Enter the email you registered with.';
  else if (!EMAIL.test(email.trim())) errors.email = "That email address doesn't look right.";
  if (!password) errors.password = 'Enter your password.';
  return errors;
}

export function validateDateRange(from, to) {
  if (from && to && to < from) return 'The end date is before the start date.';
  return '';
}
