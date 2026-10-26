// Routes of usage statistics. OWNER: Eda (dev/turkan-eda-ulucay).
import UsageStatisticsPage from './UsageStatisticsPage.jsx';
import { paths } from '../../../lib/paths.js';

export default [
  {
    path: paths.admin.statistics,
    element: <UsageStatisticsPage />,
    access: 'admin',
    layout: 'app',
    title: 'Usage statistics',
    nav: { label: 'Usage statistics', icon: 'chart', group: 'Administration', order: 60 },
  },
];
