import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function RequireAuth() {
  const { booting, isAuthed } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="container" style={{ paddingTop: 40 }}>
        <div className="card">
          <div className="cardInner">
            <div className="skeleton" style={{ height: 18, width: 260 }} />
            <div style={{ height: 12 }} />
            <div className="skeleton" style={{ height: 12, width: '100%' }} />
            <div style={{ height: 8 }} />
            <div className="skeleton" style={{ height: 12, width: '86%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}

