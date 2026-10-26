// User queries. OWNER: Melike. Baseline contains only the reads needed for login.
// TODO(Melike): createUser, updateUser, updatePassword, deleteUser, emailExists.
import { camelRow } from '../lib/rows.js';

/** Remove the password hash and convert to camelCase. Always use this before sending a user to the client. */
export function toPublicUser(row) {
  if (!row) return null;
  const { passwordHash: _passwordHash, ...rest } = camelRow(row);
  return rest;
}

/** Includes password_hash. Only use inside the login flow. The email column is case-insensitive. */
export const findUserByEmail = (db, email) => db.get('SELECT * FROM users WHERE email = ?', [email.trim()]);

export const findUserById = (db, id) => db.get('SELECT * FROM users WHERE id = ?', [id]);
