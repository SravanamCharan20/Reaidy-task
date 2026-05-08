import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function NewTicket() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.createTicket({ title, description, priority });
      navigate(`/tickets/${res.ticket._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create ticket');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container">
      <div className="rowBetween" style={{ marginBottom: 14 }}>
        <div>
          <h1 className="h1">New ticket</h1>
          <div className="muted" style={{ marginTop: 4 }}>
            Provide enough detail to help support triage quickly
          </div>
        </div>
      </div>

      <div className="card">
        <div className="cardInner" style={{ maxWidth: 760 }}>
          {error ? <div className="toast toastError">{error}</div> : null}
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <div className="field">
              <div className="label">Title</div>
              <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short summary" />
            </div>
            <div className="field">
              <div className="label">Priority</div>
              <select className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="field">
              <div className="label">Description</div>
              <textarea
                className="textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Steps to reproduce, expected behavior, actual behavior, screenshots links…"
              />
            </div>
            <div className="row">
              <button className="btn btnPrimary" disabled={busy} type="submit">
                {busy ? 'Creating…' : 'Create ticket'}
              </button>
              <button className="btn" type="button" onClick={() => navigate(-1)} disabled={busy}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

