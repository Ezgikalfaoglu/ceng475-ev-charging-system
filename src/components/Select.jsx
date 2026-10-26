// Labelled dropdown, same look and error handling as <Input>. OWNER: PM.
// Props: label, name, value, onChange, options = [{ value, label }], placeholder, error, hint, required
// Example:
//   <Select label="Connector" name="connector" value={v} onChange={onChange}
//           options={[{ value: 'CCS2', label: 'CCS2' }]} placeholder="Any connector" />
import { useId } from 'react';
import Icon from './Icon.jsx';

export default function Select({ label, name, options = [], placeholder, error, hint, required = false, className = '', ...rest }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`field ${error ? 'has-error' : ''} ${className}`.trim()}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && <span className="field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        className="field__control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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
