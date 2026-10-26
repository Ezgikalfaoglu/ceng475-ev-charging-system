// Application root: providers and the route table. OWNER: PM.
// Do not add routes here. Add them in your feature's routes.jsx (see src/routes/registry.jsx).
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RouteShell from './routes/RouteShell.jsx';
import { routes } from './routes/registry.jsx';
import { paths } from './lib/paths.js';

const notFoundRoute = { access: 'public', layout: 'public', title: 'Page not found', element: <NotFoundPage /> };

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {routes.map((route) => (
              <Route key={route.path} path={route.path} element={<RouteShell route={route} />} />
            ))}
            {/* Short URLs that forward to the right home page */}
            <Route path="/app" element={<Navigate to={paths.dashboard} replace />} />
            <Route path="/admin" element={<Navigate to={paths.admin.dashboard} replace />} />
            <Route path="*" element={<RouteShell route={notFoundRoute} />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
