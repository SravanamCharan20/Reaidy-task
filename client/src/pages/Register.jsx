import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.register({ name, email, password });
      setSession(res.token, res.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: 42 }}>
      <div className="card">
        <div className="cardInner" style={{ maxWidth: 520, margin: '0 auto' }}>
          <h1 className="h1">Create account</h1>
          <p className="muted">New accounts start with the `user` role.</p>
          <div className="divider" />
          {error ? <div className="toast toastError">{error}</div> : null}
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <div className="field">
              <div className="label">Name</div>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <div className="label">Email</div>
              <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <div className="label">Password</div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="row">
              <button className="btn btnPrimary" disabled={busy} type="submit">
                {busy ? 'Creating…' : 'Create account'}
              </button>
              <Link className="btn" to="/login">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

