export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}

export function statusLabel(status) {
  if (status === 'in_progress') return 'In progress';
  if (status === 'open') return 'Open';
  if (status === 'closed') return 'Closed';
  return status || '';
}

export function priorityLabel(p) {
  if (!p) return '';
  return p.slice(0, 1).toUpperCase() + p.slice(1);
}

