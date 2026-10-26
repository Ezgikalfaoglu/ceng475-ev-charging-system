// Routes of the profile feature. OWNER: Melike (dev/melike-sahin).
import ProfilePage from './ProfilePage.jsx';
import { paths } from '../../lib/paths.js';

export default [
  {
    path: paths.profile,
    element: <ProfilePage />,
    access: 'user',
    layout: 'app',
    title: 'My profile',
    nav: { label: 'My profile', icon: 'user', group: 'Account', order: 20 },
  },
];
