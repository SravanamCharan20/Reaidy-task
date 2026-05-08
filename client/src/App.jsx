import { Link, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './components/Guard.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import NewTicket from './pages/NewTicket.jsx';
import Register from './pages/Register.jsx';
import TicketDetail from './pages/TicketDetail.jsx';

function Topbar() {
  const { user, isAuthed, logout } = useAuth();

  return (
    <div className="topbar">
      <div className="container">
        <div className="topbarInner">
          <Link className="brand" to="/">
            <span className="brandMark" />
            <span className="brandTitle">Issue Tracker</span>
          </Link>

          <div className="row" style={{ justifyContent: 'flex-end' }}>
            {isAuthed ? (
              <>
                {user?.role === 'admin' ? (
                  <Link className="btn" to="/admin/users">
                    Users
                  </Link>
                ) : null}
                <span className="pill">
                  <span className="tag">{user?.role || 'user'}</span>
                  <span className="muted">{user?.email}</span>
                </span>
                <button className="btn btnDanger" type="button" onClick={logout}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="btn" to="/login">
                  Sign in
                </Link>
                <Link className="btn btnPrimary" to="/register">
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="appShell">
      <Topbar />
      <main className="main">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tickets/new" element={<NewTicket />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
          <Route
            path="*"
            element={
              <div className="container">
                <div className="card">
                  <div className="cardInner">
                    <h1 className="h1">Not found</h1>
                    <div className="divider" />
                    <Link className="btn" to="/">
                      Go home
                    </Link>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
