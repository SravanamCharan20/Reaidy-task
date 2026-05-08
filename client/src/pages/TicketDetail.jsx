import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime, priorityLabel, statusLabel } from '../lib/format';
import { PriorityTag, StatusTag } from '../components/Tag.jsx';

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [commentBody, setCommentBody] = useState('');
  const [commentBusy, setCommentBusy] = useState(false);

  const canManage = user?.role === 'admin' || user?.role === 'support';

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [updateBusy, setUpdateBusy] = useState(false);
  const [updateError, setUpdateError] = useState('');

  const meta = useMemo(() => {
    if (!ticket) return null;
    return {
      status: ticket.status,
      priority: ticket.priority
    };
  }, [ticket]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.getTicket(id);
      setTicket(res.ticket);
      setComments(res.comments || []);
      setStatus(res.ticket.status);
      setPriority(res.ticket.priority);
    } catch (err) {
      setError(err.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function submitComment(e) {
    e.preventDefault();
    if (!commentBody.trim()) return;
    setCommentBusy(true);
    try {
      const res = await api.addComment(id, { body: commentBody.trim() });
      setComments((c) => [...c, res.comment]);
      setCommentBody('');
    } catch (err) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setCommentBusy(false);
    }
  }

  async function saveUpdate() {
    setUpdateBusy(true);
    setUpdateError('');
    try {
      const res = await api.updateTicket(id, { status, priority });
      setTicket(res.ticket);
    } catch (err) {
      setUpdateError(err.message || 'Failed to update ticket');
    } finally {
      setUpdateBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div className="cardInner">
            <div className="skeleton" style={{ height: 20, width: '60%' }} />
            <div style={{ height: 10 }} />
            <div className="skeleton" style={{ height: 12, width: '90%' }} />
            <div style={{ height: 6 }} />
            <div className="skeleton" style={{ height: 12, width: '70%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="toast toastError">{error}</div>
        <div style={{ height: 12 }} />
        <Link className="btn" to="/">
          Back
        </Link>
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="container">
      <div className="rowBetween" style={{ marginBottom: 14 }}>
        <div>
          <h1 className="h1">{ticket.title}</h1>
          <div className="muted" style={{ marginTop: 4 }}>
            Created {formatDateTime(ticket.createdAt)} by {ticket.createdBy?.name || '—'}
          </div>
        </div>
        <Link className="btn" to="/">
          Back
        </Link>
      </div>

      <div className="grid2">
        <div className="card">
          <div className="cardInner">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="row">
                <StatusTag status={ticket.status} />
                <PriorityTag priority={ticket.priority} />
              </div>
              <div className="muted" style={{ fontSize: 13 }}>
                Updated {formatDateTime(ticket.updatedAt)}
              </div>
            </div>
            <div className="divider" />
            <div style={{ whiteSpace: 'pre-wrap' }}>{ticket.description}</div>
          </div>
        </div>

        <div className="card">
          <div className="cardInner">
            <h1 className="h1">Workflow</h1>
            <div className="muted" style={{ marginTop: 4 }}>
              {canManage ? 'Support/Admin can update status & priority' : 'Read-only'}
            </div>
            <div className="divider" />
            <div className="field" style={{ marginBottom: 10 }}>
              <div className="label">Status</div>
              <select className="select" value={status} disabled={!canManage} onChange={(e) => setStatus(e.target.value)}>
                <option value="open">{statusLabel('open')}</option>
                <option value="in_progress">{statusLabel('in_progress')}</option>
                <option value="closed">{statusLabel('closed')}</option>
              </select>
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <div className="label">Priority</div>
              <select className="select" value={priority} disabled={!canManage} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">{priorityLabel('low')}</option>
                <option value="medium">{priorityLabel('medium')}</option>
                <option value="high">{priorityLabel('high')}</option>
                <option value="urgent">{priorityLabel('urgent')}</option>
              </select>
            </div>

            {updateError ? <div className="toast toastError">{updateError}</div> : null}

            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="btn btnPrimary"
                type="button"
                disabled={!canManage || updateBusy || (meta?.status === status && meta?.priority === priority)}
                onClick={saveUpdate}
              >
                {updateBusy ? 'Saving…' : 'Save changes'}
              </button>
              <button
                className="btn"
                type="button"
                disabled={!canManage || updateBusy}
                onClick={() => {
                  setStatus(ticket.status);
                  setPriority(ticket.priority);
                }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        <div className="cardInner">
          <div className="rowBetween">
            <h1 className="h1">Comments</h1>
            <div className="muted" style={{ fontSize: 13 }}>
              {comments.length} total
            </div>
          </div>
          <div className="divider" />

          <div style={{ display: 'grid', gap: 10 }}>
            {comments.length ? (
              comments.map((c) => (
                <div key={c._id} className="toast">
                  <div className="rowBetween" style={{ marginBottom: 6 }}>
                    <div className="row">
                      <span className="tag">{c.author?.role || 'user'}</span>
                      <span className="brandTitle">{c.author?.name || 'Unknown'}</span>
                    </div>
                    <div className="muted" style={{ fontSize: 12.5 }}>
                      {formatDateTime(c.createdAt)}
                    </div>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{c.body}</div>
                </div>
              ))
            ) : (
              <div className="muted">No comments yet.</div>
            )}
          </div>

          <div className="divider" />

          <form onSubmit={submitComment} style={{ display: 'grid', gap: 10 }}>
            <div className="field">
              <div className="label">Add comment</div>
              <textarea
                className="textarea"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write an update, ask for more info, add resolution notes…"
              />
            </div>
            <div className="row">
              <button className="btn btnPrimary" type="submit" disabled={commentBusy || !commentBody.trim()}>
                {commentBusy ? 'Posting…' : 'Post comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

