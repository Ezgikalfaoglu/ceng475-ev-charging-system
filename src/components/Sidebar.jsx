// Side navigation. OWNER: PM. The links are NOT written here: they are collected from the `nav`
// field of each feature's routes.jsx (see src/routes/registry.jsx), so adding a page never
// needs a change to this file.
// Props: items [{ to, label, icon, group }], open (mobile drawer), onClose
import { NavLink } from 'react-router-dom';
import { Brand } from './Navbar.jsx';
import Icon from './Icon.jsx';

export default function Sidebar({ items, open, onClose }) {
  const groups = [...new Set(items.map((item) => item.group))];
  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'is-open' : ''}`} aria-label="Sidebar">
        <div className="sidebar__brand">
          <Brand />
        </div>
        <nav className="sidebar__nav" aria-label="Application">
          {groups.map((group) => (
            <div key={group}>
              {group && <div className="sidebar__group">{group}</div>}
              {items
                .filter((item) => item.group === group)
                .map((item) => (
                  <NavLink key={item.to} to={item.to} className="sidebar__link" onClick={onClose} end={item.end}>
                    <Icon name={item.icon} size={20} />
                    {item.label}
                  </NavLink>
                ))}
            </div>
          ))}
        </nav>
        <div className="sidebar__footer">Charging sessions in this app are simulated for demonstration.</div>
      </aside>
    </>
  );
}
