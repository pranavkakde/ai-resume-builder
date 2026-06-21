import { useState, useMemo } from 'react';
import type { RecommendationState } from '../types';
import RecommendationCard from './RecommendationCard';
import './RecommendationList.css';

interface Props {
  items: RecommendationState[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string, text: string) => void;
  onCancelEdit: (id: string) => void;
  onReset: (id: string) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
}

const categories = ['All', 'Skills', 'Experience', 'Summary', 'Education'];

export default function RecommendationList({
  items,
  onAccept,
  onReject,
  onEdit,
  onCancelEdit,
  onReset,
  onAcceptAll,
  onRejectAll,
}: Props) {
  const [filter, setFilter] = useState('All');

  const filtered = useMemo(() => {
    if (filter === 'All') return items;
    return items.filter(
      i => i.recommendation.category.toLowerCase() === filter.toLowerCase()
    );
  }, [items, filter]);

  const acceptedCount = items.filter(i => i.status === 'accepted').length;

  return (
    <div className="rec-list">
      <div className="rec-list__header">
        <h3 className="rec-list__title">
          Recommendations{' '}
          <span className="rec-list__count">
            ({acceptedCount}/{items.length} accepted)
          </span>
        </h3>
        <div className="rec-list__bulk-actions">
          <button className="btn btn-primary btn-sm" onClick={onAcceptAll}>
            ✓ Accept All
          </button>
          <button className="btn btn-ghost btn-sm" onClick={onRejectAll}>
            ✗ Reject All
          </button>
        </div>
      </div>

      <div className="rec-list__filters">
        {categories.map(cat => (
          <button
            key={cat}
            className={`rec-list__filter-btn${filter === cat ? ' rec-list__filter-btn--active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rec-list__empty">
          <div className="rec-list__empty-icon">📋</div>
          <p className="rec-list__empty-text">No recommendations in this category</p>
        </div>
      ) : (
        <div className="rec-list__cards">
          {filtered.map((item, idx) => (
            <RecommendationCard
              key={item.recommendation.id}
              state={item}
              index={idx}
              onAccept={() => onAccept(item.recommendation.id)}
              onReject={() => onReject(item.recommendation.id)}
              onEdit={(text) => onEdit(item.recommendation.id, text)}
              onCancelEdit={() => onCancelEdit(item.recommendation.id)}
              onReset={() => onReset(item.recommendation.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
