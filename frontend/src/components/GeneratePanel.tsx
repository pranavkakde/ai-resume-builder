import { useState } from 'react';
import type { GenerateMode, RecommendationState } from '../types';
import { useLLM } from '../contexts/LLMContext';
import { generateResume } from '../services/api';
import './GeneratePanel.css';

interface Props {
  resumeText: string;
  jdText: string;
  recommendations: RecommendationState[];
  structuredResume?: any;
  structuredJd?: any;
}

const modes: { key: GenerateMode; icon: string; title: string; desc: string }[] = [
  {
    key: 'enhanced',
    icon: '✨',
    title: 'Enhanced',
    desc: 'Apply only the recommendations you accepted — a targeted, controlled upgrade.',
  },
  {
    key: 'accept_all',
    icon: '🚀',
    title: 'Accept All',
    desc: 'Apply every AI suggestion automatically for maximum improvement.',
  },
  {
    key: 'overhaul',
    icon: '🔄',
    title: 'Complete Overhaul',
    desc: 'AI rewrites your entire resume from scratch, optimized for this specific role.',
  },
];

export default function GeneratePanel({ resumeText, jdText, recommendations, structuredResume, structuredJd }: Props) {
  const { settings } = useLLM();
  const [mode, setMode] = useState<GenerateMode>('enhanced');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setDownloadUrl(null);

    try {
      const accepted = recommendations
        .filter(r => r.status === 'accepted')
        .map(r => ({
          ...r.recommendation,
          suggested_text: r.editedText || r.recommendation.suggested_text,
        }));

      const blob = await generateResume({
        resume_text: resumeText,
        jd_text: jdText,
        mode,
        accepted_recommendations: mode === 'enhanced' ? accepted : [],
        provider: settings.provider,
        api_key: settings.apiKey,
        azure_endpoint: settings.azureEndpoint,
        azure_deployment: settings.azureDeployment,
        azure_api_version: settings.azureApiVersion,
        structured_resume: structuredResume,
        structured_jd: structuredJd,
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="generate-panel">
      <h3 className="generate-panel__title">📝 Generate Resume</h3>
      <p className="generate-panel__subtitle">
        Choose a generation mode and download your optimized resume
      </p>

      <div className="generate-panel__modes">
        {modes.map(m => (
          <button
            key={m.key}
            className={`generate-panel__mode-card${mode === m.key ? ' generate-panel__mode-card--selected' : ''}`}
            onClick={() => setMode(m.key)}
          >
            <div className="generate-panel__mode-icon">{m.icon}</div>
            <div className="generate-panel__mode-title">{m.title}</div>
            <div className="generate-panel__mode-desc">{m.desc}</div>
          </button>
        ))}
      </div>

      <div className="generate-panel__actions">
        <button
          className="btn btn-primary btn-lg generate-panel__generate-btn"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <span className="spinner" /> Generating...
            </>
          ) : (
            '⬇ Generate & Download'
          )}
        </button>

        {downloadUrl && (
          <a
            className="generate-panel__download"
            href={downloadUrl}
            download="optimized_resume.docx"
          >
            📥 Download DOCX
          </a>
        )}
      </div>

      {error && (
        <div className="generate-panel__error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
