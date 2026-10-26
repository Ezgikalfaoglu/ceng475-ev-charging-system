// Top bar. OWNER: PM.
//   variant="app"    signed-in pages: menu button (mobile), notification bell, user name, sign-out
//   variant="public" landing and error pages: brand, links and Sign in / Create account buttons
// Props (app):    user, unreadCount, onMenuToggle, onLogout
// Props (public): user (optional, shows a "Go to app" button when someone is signed in)
import { Link, NavLink } from 'react-router-dom';
import Button from './Button.jsx';
import Icon from './Icon.jsx';
import { initials } from '../lib/format.js';
import { homePathFor, paths } from '../lib/paths.js';

export function Brand({ to = paths.home }) {
  return (
    <Link to={to} className="brand" aria-label="VoltFlow home">
      <span className="brand__mark">
        <Icon name="bolt" size={20} />
      </span>
      VoltFlow
    </Link>
  );
}

export default function Navbar({ variant = 'app', user, unreadCount = 0, onMenuToggle, onLogout }) {
  if (variant === 'public') {
    return (
      <header className="public-nav">
        <nav className="public-nav__inner" aria-label="Main">
          <Brand />
          <div className="public-nav__links">
            {user ? (
              <Button variant="accent" size="sm" to={homePathFor(user)}>
                Open my account
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" to={paths.login}>
                  Sign in
                </Button>
                <Button variant="accent" size="sm" to={paths.register}>
                  Create account
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>
    );
  }

  return (
    <header className="topbar">
      <button type="button" className="btn btn--ghost btn--sm topbar__menu" onClick={onMenuToggle} aria-label="Open navigation menu">
        <Icon name="menu" size={22} />
      </button>
      <div className="topbar__spacer" />
      <NavLink to={paths.notifications} className="bell" aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}>
        <Icon name="bell" size={22} />
        {unreadCount > 0 && <span className="bell__count">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </NavLink>
      <div className="topbar__user">
        <span className="avatar" aria-hidden="true">
          {initials(user?.name)}
        </span>
        <div className="topbar__name">
          <strong>{user?.name}</strong>
          <span>{user?.role}</span>
        </div>
        <Button variant="ghost" size="sm" icon="logout" onClick={onLogout} aria-label="Sign out">
          <span className="sr-only">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
