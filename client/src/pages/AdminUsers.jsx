import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime } from '../lib/format';

const roleOptions = [
  { value: 'user', label: 'user' },
  { value: 'support', label: 'support' },
  { value: 'admin', label: 'admin' }
];

export default function AdminUsers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  const rows = useMemo(() => users || [], [users]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listUsers();
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  async function setRole(targetUserId, role) {
    setSavingId(targetUserId);
    setError('');
    try {
      const res = await api.setUserRole(targetUserId, role);
      setUsers((prev) => prev.map((u) => (u._id === targetUserId ? { ...u, role: res.user.role } : u)));
    } catch (err) {
      setError(err.message || 'Failed to update role');
    } finally {
      setSavingId('');
    }
  }

  if (!isAdmin) {
    return (
      <div className="container">
        <div className="card">
          <div className="cardInner">
            <h1 className="h1">Forbidden</h1>
            <div className="muted" style={{ marginTop: 6 }}>
              Admin access required.
            </div>
            <div className="divider" />
            <Link className="btn" to="/">
              Back to tickets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="rowBetween" style={{ marginBottom: 14 }}>
        <div>
          <h1 className="h1">Users</h1>
          <div className="muted" style={{ marginTop: 4 }}>
            Change roles to control access to ticket workflows.
          </div>
        </div>
        <div className="row">
          <button className="btn" type="button" onClick={load} disabled={loading}>
            {loading ? 'Loading…' : 'Reload'}
          </button>
          <Link className="btn" to="/">
            Back
          </Link>
        </div>
      </div>

      {error ? (
        <>
          <div className="toast toastError">{error}</div>
          <div style={{ height: 12 }} />
        </>
      ) : null}

      <div className="card">
        <div className="cardInner" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th style={{ width: 160 }}>Role</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4}>
                      <div className="skeleton" style={{ height: 18, width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : rows.length ? (
                rows.map((u) => (
                  <tr key={u._id}>
                    <td className="brandTitle">{u.name}</td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {u.email}
                    </td>
                    <td>
                      <select
                        className="select"
                        value={u.role}
                        disabled={savingId === u._id}
                        onChange={(e) => setRole(u._id, e.target.value)}
                      >
                        {roleOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {formatDateTime(u.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="muted" style={{ padding: 14 }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

