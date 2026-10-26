// Pop-up messages (toasts). OWNER: PM.
// Wrap the app once in <ToastProvider>, then in any component:
//   const toast = useToast();
//   toast.success('Reservation confirmed');
//   toast.error(err.message);
//   toast.warning('This slot is already booked.');
//   toast.info('Charging is simulated.');
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';

const ToastContext = createContext(null);
const ICONS = { success: 'check', error: 'alert', warning: 'alert', info: 'info' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (type, message, title) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-3), { id, type, message, title }]); // keep at most 4 on screen
      setTimeout(() => dismiss(id), type === 'error' ? 8000 : 5000);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message, title) => show('success', message, title),
      error: (message, title) => show('error', message, title),
      warning: (message, title) => show('warning', message, title),
      info: (message, title) => show('info', message, title),
    }),
    [show]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <Icon name={ICONS[t.type]} size={20} />
            <div className="toast__text">
              {t.title && <strong>{t.title}</strong>}
              {t.message}
            </div>
            <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss message">
              <Icon name="x" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside <ToastProvider>.');
  return context;
}
