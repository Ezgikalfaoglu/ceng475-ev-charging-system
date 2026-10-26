// Shown when a page could not load its data. OWNER: PM.
// Props: error (an ApiError or Error), onRetry (function that loads the data again)
import Button from './Button.jsx';
import Icon from './Icon.jsx';

export default function ErrorState({ error, onRetry, title = 'We could not load this page' }) {
  return (
    <div className="state state--error" role="alert">
      <div className="state__icon">
        <Icon name="alert" size={26} />
      </div>
      <h3>{title}</h3>
      <p>{error?.message ?? 'Something went wrong. Please try again.'}</p>
      {onRetry && (
        <Button variant="secondary" icon="refresh" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
