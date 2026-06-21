import { useMemo } from 'react';
import type { MatchResult } from '../types';
import './MatchScoreGauge.css';

interface Props {
  matchResult: MatchResult;
}

function scoreColor(score: number): 'green' | 'yellow' | 'red' {
  if (score >= 75) return 'green';
  if (score >= 50) return 'yellow';
  return 'red';
}

function strokeColorHex(score: number): string {
  if (score >= 75) return '#22c55e';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

export default function MatchScoreGauge({ matchResult }: Props) {
  const { overall_score, dimensions, summary } = matchResult;
  const color = scoreColor(overall_score);

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (overall_score / 100) * circumference;

  const gaugeStyle = useMemo(() => ({
    '--gauge-circumference': `${circumference}`,
    '--gauge-offset': `${offset}`,
    strokeDasharray: `${circumference}`,
    strokeDashoffset: `${offset}`,
    stroke: strokeColorHex(overall_score),
  } as React.CSSProperties), [circumference, offset, overall_score]);

  return (
    <div className="match-gauge">
      <div className="match-gauge__ring">
        <svg className="match-gauge__svg" viewBox="0 0 200 200">
          <circle
            className="match-gauge__track"
            cx="100"
            cy="100"
            r={radius}
          />
          <circle
            className="match-gauge__progress"
            cx="100"
            cy="100"
            r={radius}
            style={gaugeStyle}
          />
        </svg>
        <div className="match-gauge__center">
          <span className={`match-gauge__score match-gauge__score--${color}`}>
            {overall_score}
          </span>
          <span className="match-gauge__label">Match Score</span>
        </div>
      </div>

      {summary && <p className="match-gauge__summary">{summary}</p>}

      {dimensions.length > 0 && (
        <div className="match-gauge__dimensions">
          {dimensions.map((dim, idx) => {
            const dimColor = scoreColor(dim.score);
            return (
              <div
                className="dimension-card"
                key={dim.name}
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                <div className="dimension-card__header">
                  <span className="dimension-card__name">{dim.name}</span>
                  <span
                    className="dimension-card__score"
                    style={{ color: strokeColorHex(dim.score) }}
                  >
                    {dim.score}%
                  </span>
                </div>

                <div className="dimension-card__bar-track">
                  <div
                    className={`dimension-card__bar-fill dimension-card__bar-fill--${dimColor}`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>

                <div className="dimension-card__tags">
                  {dim.matched_items.slice(0, 5).map(item => (
                    <span key={item} className="dimension-card__tag dimension-card__tag--matched">
                      ✓ {item}
                    </span>
                  ))}
                  {dim.missing_items.slice(0, 5).map(item => (
                    <span key={item} className="dimension-card__tag dimension-card__tag--missing">
                      ✗ {item}
                    </span>
                  ))}
                </div>

                {dim.details && (
                  <p className="dimension-card__details">{dim.details}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
