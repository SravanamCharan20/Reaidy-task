import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatDateTime } from '../lib/format';
import { PriorityTag, StatusTag } from '../components/Tag.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'closed', label: 'Closed' }
];

const priorityOptions = [
  { value: '', label: 'All priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' }
];

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'updated', label: 'Recently updated' }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');
  const [q, setQ] = useState('');
  const [mine, setMine] = useState(user?.role === 'user' ? true : false);

  const canToggleMine = user?.role !== 'user';

  const params = useMemo(
    () => ({
      status,
      priority,
      sort,
      q: q.trim(),
      mine: mine ? 'true' : ''
    }),
    [status, priority, sort, q, mine]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.listTickets(params);
      setTickets(res.tickets || []);
    } catch (err) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="container">
      <div className="rowBetween" style={{ marginBottom: 14 }}>
        <div>
          <h1 className="h1">Tickets</h1>
          <div className="muted" style={{ marginTop: 4 }}>
            {user?.role === 'user' ? 'Your tickets' : 'All tickets'} with filters and sorting
          </div>
        </div>
        <Link className="btn btnPrimary" to="/tickets/new">
          New ticket
        </Link>
      </div>

      <div className="card" style={{ marginBottom: 14 }}>
        <div className="cardInner">
          <div className="row" style={{ gap: 10 }}>
            <div className="field" style={{ minWidth: 180, flex: '1 1 180px' }}>
              <div className="label">Search</div>
              <input className="input" placeholder="title or description" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="field" style={{ minWidth: 170, flex: '1 1 170px' }}>
              <div className="label">Status</div>
              <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 170, flex: '1 1 170px' }}>
              <div className="label">Priority</div>
              <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                {priorityOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 180, flex: '1 1 180px' }}>
              <div className="label">Sort</div>
              <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field" style={{ minWidth: 160 }}>
              <div className="label">Scope</div>
              <button
                className="btn"
                type="button"
                disabled={!canToggleMine}
                onClick={() => setMine((m) => !m)}
                title={canToggleMine ? '' : 'Users can only see their own tickets'}
              >
                {mine ? 'Mine' : 'All'}
              </button>
            </div>
            <div className="field" style={{ minWidth: 120 }}>
              <div className="label">Refresh</div>
              <button className="btn" type="button" onClick={load} disabled={loading}>
                {loading ? 'Loading…' : 'Reload'}
              </button>
            </div>
          </div>
          {error ? (
            <>
              <div className="divider" />
              <div className="toast toastError">{error}</div>
            </>
          ) : null}
        </div>
      </div>

      <div className="card">
        <div className="cardInner" style={{ padding: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Created</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5}>
                      <div className="skeleton" style={{ height: 18, width: '100%' }} />
                    </td>
                  </tr>
                ))
              ) : tickets.length ? (
                tickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <Link to={`/tickets/${t._id}`} className="brandTitle">
                        {t.title}
                      </Link>
                      <div className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                        {t.description?.slice(0, 120)}
                        {t.description?.length > 120 ? '…' : ''}
                      </div>
                    </td>
                    <td>
                      <StatusTag status={t.status} />
                    </td>
                    <td>
                      <PriorityTag priority={t.priority} />
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {formatDateTime(t.createdAt)}
                    </td>
                    <td className="muted" style={{ fontSize: 13 }}>
                      {t.createdBy?.name || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="muted" style={{ padding: 14 }}>
                    No tickets match the current filters.
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

