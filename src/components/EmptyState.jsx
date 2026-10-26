// Friendly message when a list has no items. OWNER: PM.
// Props: icon, title, message, action (a <Button> that helps the user move on)
import Icon from './Icon.jsx';

export default function EmptyState({ icon = 'list', title, message, action }) {
  return (
    <div className="state">
      <div className="state__icon">
        <Icon name={icon} size={26} />
      </div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
