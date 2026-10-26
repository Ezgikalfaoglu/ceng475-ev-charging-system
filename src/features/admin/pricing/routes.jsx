// Routes of price management. OWNER: Melike (dev/melike-sahin).
import ManagePricingPage from './ManagePricingPage.jsx';
import { paths } from '../../../lib/paths.js';

export default [
  {
    path: paths.admin.pricing,
    element: <ManagePricingPage />,
    access: 'admin',
    layout: 'app',
    title: 'Manage prices',
    nav: { label: 'Prices', icon: 'euro', group: 'Administration', order: 40 },
  },
];
