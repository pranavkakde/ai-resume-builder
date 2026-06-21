import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LLMSettings } from '../types';

interface LLMContextValue {
  settings: LLMSettings;
  updateSettings: (settings: Partial<LLMSettings>) => void;
  isConfigured: boolean;
}

const LLMContext = createContext<LLMContextValue | undefined>(undefined);

export function LLMProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LLMSettings>(() => {
    const provider = localStorage.getItem('resumeai-llm-provider') || 'gemini';
    const apiKey = localStorage.getItem('resumeai-llm-apikey') || '';
    const azureEndpoint = localStorage.getItem('resumeai-llm-azure-endpoint') || '';
    const azureDeployment = localStorage.getItem('resumeai-llm-azure-deployment') || '';
    const azureApiVersion = localStorage.getItem('resumeai-llm-azure-apiversion') || '';
    return { provider, apiKey, azureEndpoint, azureDeployment, azureApiVersion };
  });

  const updateSettings = useCallback((partial: Partial<LLMSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('resumeai-llm-provider', next.provider);
      localStorage.setItem('resumeai-llm-apikey', next.apiKey);
      localStorage.setItem('resumeai-llm-azure-endpoint', next.azureEndpoint || '');
      localStorage.setItem('resumeai-llm-azure-deployment', next.azureDeployment || '');
      localStorage.setItem('resumeai-llm-azure-apiversion', next.azureApiVersion || '');
      return next;
    });
  }, []);

  let isConfigured = settings.apiKey.trim().length > 0;
  if (settings.provider === 'azure') {
    isConfigured = isConfigured && 
      (settings.azureEndpoint?.trim() || '').length > 0 &&
      (settings.azureDeployment?.trim() || '').length > 0;
  }

  return (
    <LLMContext.Provider value={{ settings, updateSettings, isConfigured }}>
      {children}
    </LLMContext.Provider>
  );
}

export function useLLM(): LLMContextValue {
  const context = useContext(LLMContext);
  if (!context) {
    throw new Error('useLLM must be used within a LLMProvider');
  }
  return context;
}
