// Small server-side validation helpers. OWNER: PM (feature owners add their own rules in
// their route files and may add generic helpers here through a PM-reviewed PR).
import { badRequest } from './errors.js';

export const isEmail = (value) =>
  typeof value === 'string' && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());

export const isText = (value, { min = 1, max = 200 } = {}) =>
  typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;

export const isNumberBetween = (value, min, max) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;

/** Throw a 400 VALIDATION_ERROR when the `errors` object has any entry. */
export function assertValid(errors) {
  if (Object.keys(errors).length > 0) throw badRequest('Please fix the highlighted fields.', errors);
}

/** Parse an id from the URL (or query). Throws 400 for anything that is not a positive integer. */
export function parseId(value, name = 'id') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw badRequest(`"${name}" must be a positive whole number.`, { [name]: 'Invalid id.' });
  return id;
}
