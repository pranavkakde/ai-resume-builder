import { useState, useCallback } from 'react';
import { useLLM } from '../contexts/LLMContext';
import { analyzeMatch } from '../services/api';
import type { AnalyzeResponse, RecommendationState } from '../types';
import StepIndicator from '../components/StepIndicator';
import ResumeUploader from '../components/ResumeUploader';
import JDInput from '../components/JDInput';
import MatchScoreGauge from '../components/MatchScoreGauge';
import RecommendationList from '../components/RecommendationList';
import GeneratePanel from '../components/GeneratePanel';
import './AnalyzerPage.css';

export default function AnalyzerPage() {
  const { settings, isConfigured } = useLLM();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 state
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [, setResumeFilename] = useState('');

  // Step 2 state
  const [analyzeResponse, setAnalyzeResponse] = useState<AnalyzeResponse | null>(null);
  const [recStates, setRecStates] = useState<RecommendationState[]>([]);

  // Loading / error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Settings modal trigger
  const [showSettingsHint, setShowSettingsHint] = useState(false);

  const canAnalyze = resumeText.trim().length > 0 && jdText.trim().length > 0;

  const handleAnalyze = useCallback(async () => {
    if (!isConfigured) {
      setShowSettingsHint(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await analyzeMatch(
        resumeText,
        jdText,
        settings.provider,
        settings.apiKey,
        settings.azureEndpoint,
        settings.azureDeployment,
        settings.azureApiVersion
      );
      setAnalyzeResponse(response);
      setRecStates(
        response.recommendations.map(r => ({
          recommendation: r,
          status: 'pending' as const,
          editedText: null,
          isEditing: false,
        }))
      );
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [resumeText, jdText, settings, isConfigured]);

  // Recommendation handlers
  const handleAccept = (id: string) => {
    setRecStates(prev =>
      prev.map(r =>
        r.recommendation.id === id
          ? { ...r, status: 'accepted', isEditing: false }
          : r
      )
    );
  };

  const handleReject = (id: string) => {
    setRecStates(prev =>
      prev.map(r =>
        r.recommendation.id === id
          ? { ...r, status: 'rejected', isEditing: false }
          : r
      )
    );
  };

  const handleEdit = (id: string, text: string) => {
    setRecStates(prev =>
      prev.map(r => {
        if (r.recommendation.id !== id) return r;
        if (r.isEditing) {
          // Save
          return { ...r, editedText: text, isEditing: false, status: 'accepted' };
        }
        // Start editing
        return { ...r, isEditing: true };
      })
    );
  };

  const handleCancelEdit = (id: string) => {
    setRecStates(prev =>
      prev.map(r =>
        r.recommendation.id === id ? { ...r, isEditing: false } : r
      )
    );
  };

  const handleReset = (id: string) => {
    setRecStates(prev =>
      prev.map(r =>
        r.recommendation.id === id
          ? { ...r, status: 'pending', editedText: null, isEditing: false }
          : r
      )
    );
  };

  const handleAcceptAll = () => {
    setRecStates(prev =>
      prev.map(r => ({ ...r, status: 'accepted' as const, isEditing: false }))
    );
  };

  const handleRejectAll = () => {
    setRecStates(prev =>
      prev.map(r => ({ ...r, status: 'rejected' as const, isEditing: false }))
    );
  };

  return (
    <div className="page analyzer-page container">
      <StepIndicator currentStep={currentStep} />

      {/* ── Step 1: Input ──────────────────────────────── */}
      {currentStep === 1 && (
        <>
          {!isConfigured && showSettingsHint && (
            <div className="analyzer-input__warning">
              <span>⚠</span>
              <span>
                {settings.provider === 'azure'
                  ? 'For Azure, you must provide the API Key, Endpoint, and Deployment Name.'
                  : 'Please configure your LLM API key first.'}{' '}
                <button onClick={() => {
                  const btn = document.querySelector('.navbar__settings-btn') as HTMLButtonElement;
                  btn?.click();
                  setShowSettingsHint(false);
                }}>
                  Open Settings
                </button>
              </span>
            </div>
          )}

          {isLoading ? (
            <div className="analyzer-loading">
              <div className="spinner spinner-lg" />
              <span className="analyzer-loading__text">Analyzing your resume...</span>
              <span className="analyzer-loading__subtext">
                This may take 15–30 seconds depending on the LLM provider
              </span>
            </div>
          ) : error ? (
            <div className="analyzer-error">
              <span className="analyzer-error__icon">😕</span>
              <p className="analyzer-error__message">{error}</p>
              <button className="btn btn-primary" onClick={handleAnalyze}>
                ↻ Retry Analysis
              </button>
              <button className="btn btn-ghost" onClick={() => setError(null)}>
                Back to Input
              </button>
            </div>
          ) : (
            <div className="analyzer-input">
              <ResumeUploader
                resumeText={resumeText}
                onTextChange={setResumeText}
                onFileUploaded={setResumeFilename}
              />
              <JDInput value={jdText} onChange={setJdText} />
              <div className="analyzer-input__action-row">
                <button
                  className="btn btn-primary btn-lg"
                  disabled={!canAnalyze}
                  onClick={handleAnalyze}
                >
                  🎯 Analyze Match
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Step 2: Results ────────────────────────────── */}
      {currentStep === 2 && analyzeResponse && (
        <div className="analyzer-results">
          <MatchScoreGauge matchResult={analyzeResponse.match_result} />

          <RecommendationList
            items={recStates}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEdit}
            onCancelEdit={handleCancelEdit}
            onReset={handleReset}
            onAcceptAll={handleAcceptAll}
            onRejectAll={handleRejectAll}
          />

          <div className="analyzer-results__nav">
            <button className="btn btn-ghost" onClick={() => setCurrentStep(1)}>
              ← Back to Input
            </button>
            <button className="btn btn-primary btn-lg" onClick={() => setCurrentStep(3)}>
              Continue to Generate →
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Generate ───────────────────────────── */}
      {currentStep === 3 && (
        <div className="analyzer-generate">
          <div className="analyzer-generate__back">
            <button className="btn btn-ghost" onClick={() => setCurrentStep(2)}>
              ← Back to Recommendations
            </button>
          </div>
          <GeneratePanel
            resumeText={resumeText}
            jdText={jdText}
            recommendations={recStates}
            structuredResume={analyzeResponse?.structured_resume}
            structuredJd={analyzeResponse?.structured_jd}
          />
        </div>
      )}
    </div>
  );
}
