import { useState } from 'react';
import type { Application } from '../types';
import './ApplicationCard.css';

interface Props {
  application: Application;
  onStatusChange: (id: number, status: string) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: number) => void;
  index: number;
}

function scoreColorClass(score: number): string {
  if (score >= 75) return 'app-card__score--green';
  if (score >= 50) return 'app-card__score--yellow';
  return 'app-card__score--red';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const statuses = ['saved', 'applied', 'interviewing', 'offered', 'rejected'];

export default function ApplicationCard({
  application: app,
  onStatusChange,
  onEdit,
  onDelete,
  index,
}: Props) {
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="app-card glass-card" style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="app-card__top">
        <div className="app-card__info">
          <div className="app-card__company">{app.company_name}</div>
          <div className="app-card__title">{app.job_title}</div>
        </div>
        {app.match_score > 0 && (
          <div className={`app-card__score ${scoreColorClass(app.match_score)}`}>
            {app.match_score}%
          </div>
        )}
      </div>

      <div className="app-card__middle">
        <select
          className="app-card__status-select"
          value={app.status}
          onChange={e => onStatusChange(app.id, e.target.value)}
          aria-label="Status"
        >
          {statuses.map(s => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <span className="app-card__date">
          {app.applied_date
            ? `Applied ${formatDate(app.applied_date)}`
            : `Saved ${formatDate(app.created_at)}`}
        </span>

        {app.notes && (
          <button
            className="app-card__notes-toggle"
            onClick={() => setShowNotes(v => !v)}
          >
            {showNotes ? '▾ Hide Notes' : '▸ Show Notes'}
          </button>
        )}
      </div>

      {showNotes && app.notes && (
        <div className="app-card__notes">{app.notes}</div>
      )}

      <div className="app-card__actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onEdit(app)}>
          ✎ Edit
        </button>
        <button className="btn btn-danger btn-sm" onClick={() => onDelete(app.id)}>
          🗑 Delete
        </button>
      </div>
    </div>
  );
}
