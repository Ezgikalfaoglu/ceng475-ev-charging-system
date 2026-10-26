// Data loading hook. OWNER: PM.
//   const { data, error, loading, reload } = useAsync(() => api.get('/stations'), []);
// Runs `load` when the component mounts and whenever a value in `deps` changes. Answers that
// arrive after the component changed its mind (older request) are ignored.
import { useCallback, useEffect, useRef, useState } from 'react';

export function useAsync(load, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const latest = useRef(0);

  const run = useCallback(() => {
    const id = ++latest.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(load)
      .then((data) => {
        if (id === latest.current) setState({ data, error: null, loading: false });
      })
      .catch((error) => {
        if (id === latest.current) setState({ data: null, error, loading: false });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
    return () => {
      latest.current += 1; // ignore the answer of a request that is no longer needed
    };
  }, [run]);

  return { ...state, reload: run };
}
