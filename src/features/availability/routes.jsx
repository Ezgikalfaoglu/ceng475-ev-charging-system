// Routes of the slot availability feature. OWNER: Berfin (dev/berfin-ozcelik).
import SlotAvailabilityPage from './SlotAvailabilityPage.jsx';

export default [
  {
    path: '/app/availability',
    element: <SlotAvailabilityPage />,
    access: 'customer',
    layout: 'app',
    title: 'Slot availability',
    nav: { label: 'Check availability', icon: 'calendar', group: 'Charging', order: 30 },
  },
];
