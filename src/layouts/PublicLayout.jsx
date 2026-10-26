// Layout for public pages (landing, 404, unauthorized). OWNER: PM.
import Navbar from '../components/Navbar.jsx';
import { Brand } from '../components/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function PublicLayout({ children }) {
  const { user } = useAuth();
  return (
    <>
      <Navbar variant="public" user={user} />
      <main id="main">{children}</main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <Brand />
          <span>CENG 475 Advanced Web Programming with React · EV charging reservation demo</span>
        </div>
      </footer>
    </>
  );
}
