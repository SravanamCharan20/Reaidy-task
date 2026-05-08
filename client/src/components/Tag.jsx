import { priorityLabel, statusLabel } from '../lib/format';

export function StatusTag({ status }) {
  const cls =
    status === 'open' ? 'tag tagOpen' : status === 'in_progress' ? 'tag tagInProgress' : 'tag tagClosed';
  return <span className={cls}>{statusLabel(status)}</span>;
}

export function PriorityTag({ priority }) {
  const cls =
    priority === 'low'
      ? 'tag tagLow'
      : priority === 'medium'
        ? 'tag tagMedium'
        : priority === 'high'
          ? 'tag tagHigh'
          : 'tag tagUrgent';
  return <span className={cls}>{priorityLabel(priority)}</span>;
}

