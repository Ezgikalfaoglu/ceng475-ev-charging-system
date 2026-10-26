// Marks a screen (or part of it) as a starter that a teammate still has to finish. OWNER: PM.
// The owner DELETES the <StarterNotice> when their feature is complete. It keeps the demo honest:
// nobody can mistake a placeholder for a finished feature.
// Props: owner ({ name, branch } from shared/owners.js), todo (array of short sentences)
import Icon from './Icon.jsx';

export default function StarterNotice({ owner, todo = [] }) {
  return (
    <div className="starter-notice" role="note">
      <Icon name="info" size={20} />
      <div>
        <strong>Starter screen.</strong> Read-only baseline from the main branch. To be completed by {owner.name} on branch{' '}
        <code>{owner.branch}</code>.
        {todo.length > 0 && (
          <ul>
            {todo.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
