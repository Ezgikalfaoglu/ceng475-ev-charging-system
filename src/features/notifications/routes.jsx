// Routes of the notification feature. OWNER: Melike (dev/melike-sahin).
import NotificationCenterPage from './NotificationCenterPage.jsx';
import { paths } from '../../lib/paths.js';

export default [
  {
    path: paths.notifications,
    element: <NotificationCenterPage />,
    access: 'user',
    layout: 'app',
    title: 'Notifications',
    nav: { label: 'Notifications', icon: 'bell', group: 'Account', order: 10 },
  },
];
