// Layout for every signed-in page: sidebar + top bar + content. OWNER: PM.
// The sidebar links come from the route registry, filtered by the user's role.
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUnreadCount } from '../hooks/useUnreadCount.js';
import { navItemsFor } from '../routes/registry.jsx';
import { paths } from '../lib/paths.js';

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const unreadCount = useUnreadCount(Boolean(user));
  const items = useMemo(() => navItemsFor(user), [user]);

  // Close the mobile drawer and jump to the top whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate(paths.login, { replace: true });
  };

  return (
    <div className="app-shell">
      <a href="#main" className="sr-only">
        Skip to content
      </a>
      <Sidebar items={items} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="app-body">
        <Navbar variant="app" user={user} unreadCount={unreadCount} onMenuToggle={() => setMenuOpen((open) => !open)} onLogout={handleLogout} />
        <main id="main" className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
