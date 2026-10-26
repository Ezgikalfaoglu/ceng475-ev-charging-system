// Client-side form validation (vanilla JavaScript). OWNER: PM.
// Every function returns an error message, or an empty string when the value is fine.
// These checks give instant feedback; the server repeats them and is the source of truth.
import { PASSWORD_MIN_LENGTH } from '../../shared/constants.js';

export const requiredError = (value, label = 'This field') =>
  String(value ?? '').trim() === '' ? `${label} is required.` : '';

export function emailError(value) {
  if (requiredError(value)) return 'E-mail address is required.';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim()) ? '' : 'Enter a valid e-mail address, for example name@example.com.';
}

export function passwordError(value) {
  const text = String(value ?? '');
  if (!text) return 'Password is required.';
  if (text.length < PASSWORD_MIN_LENGTH) return `Use at least ${PASSWORD_MIN_LENGTH} characters.`;
  if (!/[a-z]/i.test(text) || !/\d/.test(text)) return 'Use letters and at least one number.';
  return '';
}

export function nameError(value) {
  const text = String(value ?? '').trim();
  if (!text) return 'Name is required.';
  return text.length < 2 ? 'Name must have at least 2 characters.' : '';
}

/**
 * Run a rules object over form values.
 *   const errors = validateForm(values, { email: emailError, password: (v) => requiredError(v, 'Password') });
 * Returns an object with one message per invalid field (empty object = valid).
 */
export function validateForm(values, rules) {
  const errors = {};
  for (const [field, rule] of Object.entries(rules)) {
    const message = rule(values[field], values);
    if (message) errors[field] = message;
  }
  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
