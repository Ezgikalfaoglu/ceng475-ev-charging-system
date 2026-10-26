// Profile routes for the signed-in user. OWNER: Melike (branch dev/melike-sahin).
// Baseline: GET /profile.
// TODO(Melike): PUT /profile (name, phone, vehicle), PUT /password (current + new password),
//               DELETE /profile (delete own account after password confirmation).
import { Router } from 'express';
import { notImplemented } from '../lib/errors.js';
import { MELIKE } from '../../shared/owners.js';

const router = Router();

router.get('/profile', (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', () => {
  throw notImplemented(MELIKE, 'Profile update');
});

router.put('/password', () => {
  throw notImplemented(MELIKE, 'Password change');
});

router.delete('/profile', () => {
  throw notImplemented(MELIKE, 'Account deletion');
});

export default router;
