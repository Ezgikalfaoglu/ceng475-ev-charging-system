// Routes of the authentication feature. OWNER: Melike (dev/melike-sahin).
import LoginPage from './LoginPage.jsx';
import RegisterPage from './RegisterPage.jsx';
import { paths } from '../../lib/paths.js';

export default [
  { path: paths.login, element: <LoginPage />, access: 'guest', layout: 'auth', title: 'Sign in' },
  { path: paths.register, element: <RegisterPage />, access: 'guest', layout: 'auth', title: 'Create account' },
];
