// Authentication and authorization middleware. OWNER: PM (login/register logic lives in
// server/routes/auth.js and belongs to Melike).
//
// How it works
//   1. authenticate() runs on every request. If an "Authorization: Bearer <token>" header holds
//      a valid token, the user is loaded from the database and stored in req.user.
//      It never rejects by itself.
//   2. requireAuth rejects requests without req.user (401).
//   3. requireRole('admin') rejects users with another role (403). Role checks are enforced
//      here on the server, so hiding a button in React is never the only protection.
// The registry in server/routes/index.js applies these, so a route file cannot forget them.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { unauthorized, forbidden } from './errors.js';
import { findUserById, toPublicUser } from '../queries/users.js';

/** Use JWT_SECRET if set, otherwise create a random secret once and keep it in data/.jwt-secret. */
export function loadJwtSecret(configuredSecret, dataDir) {
  if (configuredSecret) return configuredSecret;
  if (!dataDir) return crypto.randomBytes(32).toString('hex');
  const file = path.join(dataDir, '.jwt-secret');
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8').trim();
  const secret = crypto.randomBytes(32).toString('hex');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(file, secret, { mode: 0o600 });
  return secret;
}

export const signToken = (user, secret, expiresIn) => jwt.sign({ sub: String(user.id), role: user.role }, secret, { expiresIn });

export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return next();
  try {
    const payload = jwt.verify(token, req.app.locals.jwtSecret);
    const user = findUserById(req.db, Number(payload.sub));
    if (user) req.user = toPublicUser(user);
    return next();
  } catch {
    // Public routes keep working with a stale token; protected routes answer 401 (see below).
    req.tokenInvalid = true;
    return next();
  }
}

const notSignedIn = (req) =>
  req.tokenInvalid
    ? unauthorized('Your session has expired. Please sign in again.', 'TOKEN_INVALID')
    : unauthorized();

export function requireAuth(req, res, next) {
  if (!req.user) return next(notSignedIn(req));
  return next();
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(notSignedIn(req));
  if (!roles.includes(req.user.role)) return next(forbidden('This area is only available to administrators.'));
  return next();
};
