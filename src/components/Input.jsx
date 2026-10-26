// Labelled text input with built-in error and hint text. OWNER: PM.
// Props:
//   label, name, value, onChange   standard controlled input
//   error   message shown under the field (also sets aria-invalid for screen readers)
//   hint    helper text shown when there is no error
//   type    'text' | 'email' | 'password' | 'number' | 'date' | 'time' ...  (password gets a show/hide button)
// Example:
//   <Input label="E-mail" name="email" type="email" value={values.email} onChange={onChange} error={errors.email} required />
import { useId, useState } from 'react';
import Icon from './Icon.jsx';

export default function Input({ label, name, type = 'text', error, hint, required = false, className = '', ...rest }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const isPassword = type === 'password';

  const control = (
    <input
      id={id}
      name={name}
      type={isPassword && visible ? 'text' : type}
      className="field__control"
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      aria-required={required || undefined}
      {...rest}
    />
  );

  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && <span className="field__required" aria-hidden="true">*</span>}
        </label>
      )}
      {isPassword ? (
        <div className="field__wrap">
          {control}
          <button
            type="button"
            className="field__toggle"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
          >
            <Icon name={visible ? 'eyeOff' : 'eye'} size={18} />
          </button>
        </div>
      ) : (
        control
      )}
      {error ? (
        <p id={`${id}-error`} className="field__error" role="alert">
          <Icon name="alert" size={14} />
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="field__hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
