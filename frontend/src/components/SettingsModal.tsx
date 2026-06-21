import { useState, useEffect } from 'react';
import { useLLM } from '../contexts/LLMContext';
import './SettingsModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const providers = [
  { key: 'gemini', name: 'Gemini', icon: '✦' },
  { key: 'openai', name: 'OpenAI', icon: '◎' },
  { key: 'groq', name: 'Groq', icon: '⚡' },
  { key: 'azure', name: 'Azure', icon: '☁' },
];

export default function SettingsModal({ isOpen, onClose }: Props) {
  const { settings, updateSettings, isConfigured } = useLLM();
  const [provider, setProvider] = useState(settings.provider);
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [azureEndpoint, setAzureEndpoint] = useState(settings.azureEndpoint || '');
  const [azureDeployment, setAzureDeployment] = useState(settings.azureDeployment || '');
  const [azureApiVersion, setAzureApiVersion] = useState(settings.azureApiVersion || '');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProvider(settings.provider);
      setApiKey(settings.apiKey);
      setAzureEndpoint(settings.azureEndpoint || '');
      setAzureDeployment(settings.azureDeployment || '');
      setAzureApiVersion(settings.azureApiVersion || '');
      setShowKey(false);
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateSettings({ 
      provider, 
      apiKey,
      azureEndpoint: provider === 'azure' ? azureEndpoint : undefined,
      azureDeployment: provider === 'azure' ? azureDeployment : undefined,
      azureApiVersion: provider === 'azure' ? azureApiVersion : undefined,
    });
    onClose();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="settings-modal"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="LLM Settings"
      >
        <div className="settings-modal__header">
          <h2 className="settings-modal__title">⚙ LLM Settings</h2>
          <button className="settings-modal__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {isConfigured ? (
          <div className="settings-modal__status">
            <span>✓</span>
            <span>API key configured for {settings.provider}</span>
          </div>
        ) : (
          <div className="settings-modal__status settings-modal__status--warning">
            <span>⚠</span>
            <span>
              {provider === 'azure' 
                ? "Missing Azure Endpoint, Deployment Name, or API Key" 
                : "No API key set — analysis won't work"}
            </span>
          </div>
        )}

        <div className="settings-modal__section">
          <div className="settings-modal__section-label">Provider</div>
          <div className="settings-modal__providers">
            {providers.map(p => (
              <button
                key={p.key}
                className={`settings-modal__provider${provider === p.key ? ' settings-modal__provider--active' : ''}`}
                onClick={() => setProvider(p.key)}
              >
                <span className="settings-modal__provider-icon">{p.icon}</span>
                <span className="settings-modal__provider-name">{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-modal__section">
          <div className="settings-modal__section-label">API Key</div>
          <div className="settings-modal__key-wrapper">
            <input
              type={showKey ? 'text' : 'password'}
              className="settings-modal__key-input"
              placeholder="Enter your API key..."
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              autoComplete="off"
            />
            <button
              className="settings-modal__toggle-vis"
              onClick={() => setShowKey(v => !v)}
              aria-label={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {provider === 'azure' && (
          <>
            <div className="settings-modal__section">
              <div className="settings-modal__section-label">Azure Endpoint</div>
              <input
                type="text"
                className="settings-modal__key-input"
                placeholder="https://your-resource.openai.azure.com/"
                value={azureEndpoint}
                onChange={e => setAzureEndpoint(e.target.value)}
              />
            </div>
            <div className="settings-modal__section">
              <div className="settings-modal__section-label">Deployment Name</div>
              <input
                type="text"
                className="settings-modal__key-input"
                placeholder="e.g., gpt-4o"
                value={azureDeployment}
                onChange={e => setAzureDeployment(e.target.value)}
              />
            </div>
            <div className="settings-modal__section">
              <div className="settings-modal__section-label">API Version (Optional)</div>
              <input
                type="text"
                className="settings-modal__key-input"
                placeholder="e.g., 2024-02-15-preview"
                value={azureApiVersion}
                onChange={e => setAzureApiVersion(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="settings-modal__actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
