// Authentication routes. OWNER: Melike (branch dev/melike-sahin).
//
// Baseline on main:  POST /login and GET /me work, so every role can be demonstrated.
// TODO(Melike):      POST /register (validation, duplicate e-mail 409, hashed password),
//                    login throttling after repeated failures, password rules.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { requireAuth, signToken } from '../lib/auth.js';
import { assertValid, isEmail } from '../lib/validate.js';
import { notImplemented, unauthorized } from '../lib/errors.js';
import { findUserByEmail, toPublicUser } from '../queries/users.js';
import { MELIKE } from '../../shared/owners.js';

const router = Router();

// Compared against when the e-mail is unknown, so "unknown user" and "wrong password" take the
// same time and give the same message (prevents account enumeration).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds);

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  const errors = {};
  if (!isEmail(email)) errors.email = 'Enter a valid e-mail address.';
  if (typeof password !== 'string' || password.length === 0) errors.password = 'Enter your password.';
  assertValid(errors);

  const user = findUserByEmail(req.db, email);
  const passwordOk = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
  if (!user || !passwordOk) throw unauthorized('E-mail or password is incorrect.', 'INVALID_CREDENTIALS');

  const token = signToken(user, req.app.locals.jwtSecret, config.tokenTtl);
  res.json({ token, user: toPublicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.post('/register', () => {
  throw notImplemented(MELIKE, 'Registration');
});

export default router;
