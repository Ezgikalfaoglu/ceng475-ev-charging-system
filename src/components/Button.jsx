// Reusable button. OWNER: PM.
// Props:
//   variant  'primary' | 'accent' | 'secondary' | 'ghost' | 'danger' | 'outline-light' (for dark backgrounds)
//            default 'primary'
//   size     'sm' | 'md' | 'lg'
//   icon     name of an <Icon> shown before the text
//   loading  shows a spinner and blocks clicks while a request is running
//   to       when given, renders a router <Link> that looks like a button
// All other props (onClick, disabled, type, title, aria-*) go to the element.
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

export default function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  block = false,
  to,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const classes = ['btn', `btn--${variant}`, size !== 'md' && `btn--${size}`, block && 'btn--block', loading && 'is-loading', className]
    .filter(Boolean)
    .join(' ');
  const content = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  const { disabled, ...buttonProps } = rest;
  return (
    <button type={type} className={classes} aria-busy={loading || undefined} {...buttonProps} disabled={disabled || loading}>
      {content}
    </button>
  );
}
