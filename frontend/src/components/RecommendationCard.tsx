import { useState } from 'react';
import type { RecommendationState } from '../types';
import './RecommendationCard.css';

interface Props {
  state: RecommendationState;
  onAccept: () => void;
  onReject: () => void;
  onEdit: (text: string) => void;
  onCancelEdit: () => void;
  onReset: () => void;
  index: number;
}

const categoryBadge: Record<string, string> = {
  skills: 'badge-blue',
  experience: 'badge-purple',
  summary: 'badge-green',
  education: 'badge-orange',
  certifications: 'badge-orange',
  general: 'badge-gray',
};

export default function RecommendationCard({
  state,
  onAccept,
  onReject,
  onEdit,
  onCancelEdit,
  onReset,
  index,
}: Props) {
  const { recommendation: rec, status, editedText, isEditing } = state;
  const [showReasoning, setShowReasoning] = useState(false);
  const [localText, setLocalText] = useState(editedText || rec.suggested_text);

  const badgeClass = categoryBadge[rec.category.toLowerCase()] || 'badge-gray';

  const cardClass = [
    'rec-card',
    status === 'accepted' ? 'rec-card--accepted' : '',
    status === 'rejected' ? 'rec-card--rejected' : '',
    isEditing ? 'rec-card--editing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const handleEditSave = () => {
    onEdit(localText);
  };

  return (
    <div className={cardClass} style={{ animationDelay: `${index * 0.06}s` }}>
      <div className="rec-card__header">
        <span
          className={`rec-card__priority rec-card__priority--${rec.priority.toLowerCase()}`}
          title={`${rec.priority} priority`}
        />
        <span className="rec-card__title">{rec.title}</span>
        <span className={`badge rec-card__category ${badgeClass}`}>
          {rec.category}
        </span>
      </div>

      <button
        className="rec-card__reasoning-toggle"
        onClick={() => setShowReasoning(v => !v)}
      >
        {showReasoning ? '▾' : '▸'} Reasoning
      </button>

      {showReasoning && (
        <div className="rec-card__reasoning">{rec.reasoning}</div>
      )}

      {isEditing ? (
        <textarea
          className="rec-card__edit-area"
          value={localText}
          onChange={e => setLocalText(e.target.value)}
          autoFocus
        />
      ) : rec.original_text ? (
        <div className="rec-card__diff">
          <div className="rec-card__diff-col rec-card__diff-original">
            <div className="rec-card__diff-label">Current</div>
            {rec.original_text}
          </div>
          <div className="rec-card__diff-col rec-card__diff-suggested">
            <div className="rec-card__diff-label">Suggested</div>
            {editedText || rec.suggested_text}
          </div>
        </div>
      ) : (
        <div className="rec-card__diff-single">
          <div className="rec-card__diff-col rec-card__diff-suggested">
            <div className="rec-card__diff-label">Suggested Addition</div>
            {editedText || rec.suggested_text}
          </div>
        </div>
      )}

      <div className="rec-card__actions">
        {status !== 'accepted' && !isEditing && (
          <button className="rec-card__action-btn rec-card__action-btn--accept" onClick={onAccept}>
            ✓ Accept
          </button>
        )}
        {status !== 'rejected' && !isEditing && (
          <button className="rec-card__action-btn rec-card__action-btn--reject" onClick={onReject}>
            ✗ Reject
          </button>
        )}
        {!isEditing && status !== 'rejected' && (
          <button
            className="rec-card__action-btn rec-card__action-btn--edit"
            onClick={() => {
              setLocalText(editedText || rec.suggested_text);
              onEdit(editedText || rec.suggested_text);
            }}
          >
            ✎ Edit
          </button>
        )}
        {isEditing && (
          <>
            <button className="rec-card__action-btn rec-card__action-btn--accept" onClick={handleEditSave}>
              ✓ Save
            </button>
            <button className="rec-card__action-btn rec-card__action-btn--reject" onClick={onCancelEdit}>
              ✗ Cancel
            </button>
          </>
        )}
        {(status !== 'pending' || editedText) && (
          <button className="rec-card__action-btn rec-card__action-btn--reset" onClick={onReset}>
            ↻ Reset
          </button>
        )}
      </div>
    </div>
  );
}
