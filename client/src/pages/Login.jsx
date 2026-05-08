import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

const DEMO_PASSWORD = 'Password123!';
const demoAccounts = [
  { role: 'admin', email: 'admin@demo.com', tone: 'primary' },
  { role: 'support', email: 'support@demo.com', tone: 'info' },
  { role: 'user', email: 'user@demo.com', tone: 'success' }
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSession } = useAuth();

  const from = useMemo(() => location.state?.from || '/', [location.state]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function useDemo(demo) {
    setEmail(demo.email);
    setPassword(DEMO_PASSWORD);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.login({ email, password });
      setSession(res.token, res.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 42 }}>
      <div className="grid2">
        <div className="card">
          <div className="cardInner">
            <h1 className="h1">Sign in</h1>
            <p className="muted">Pick a demo role or sign in with your account.</p>
            <div className="divider" />
            {error ? <div className="toast toastError">{error}</div> : null}
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
              <div className="field">
                <div className="label">Email</div>
                <input
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              <div className="field">
                <div className="label">Password</div>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="row">
                <button className="btn btnPrimary" disabled={busy || !email || !password} type="submit">
                  {busy ? 'Signing in…' : 'Sign in'}
                </button>
                <Link className="btn" to="/register">
                  Create account
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="cardInner">
            <h1 className="h1">Demo credentials</h1>
            <p className="muted">Click a role to auto-fill the sign-in form.</p>
            <div className="divider" />
            <div className="demoGrid">
              {demoAccounts.map((d) => (
                <button key={d.role} type="button" className={`demoCard demoCard_${d.tone}`} onClick={() => useDemo(d)}>
                  <div className="rowBetween" style={{ alignItems: 'flex-start' }}>
                    <div style={{ display: 'grid', gap: 6 }}>
                      <div className="demoTitle">{d.role}</div>
                      <div className="muted" style={{ fontSize: 13 }}>
                        {d.email}
                      </div>
                    </div>
                    <span className="tag">Use</span>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ height: 10 }} />
            <div className="muted" style={{ fontSize: 13 }}>
              Password: <span className="tag">{DEMO_PASSWORD}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

