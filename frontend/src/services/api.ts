import type { AnalyzeResponse, Application, GenerateRequest } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // use default message
    }
    throw new ApiError(message, response.status);
  }
  return response.json() as Promise<T>;
}

export async function uploadResume(
  file: File
): Promise<{ filename: string; text: string; page_count: number }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/api/upload-resume`, {
    method: 'POST',
    body: formData,
  });

  return handleResponse(response);
}

export async function analyzeMatch(
  resumeText: string,
  jdText: string,
  provider: string,
  apiKey: string,
  azureEndpoint?: string,
  azureDeployment?: string,
  azureApiVersion?: string
): Promise<AnalyzeResponse> {
  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resume_text: resumeText,
      jd_text: jdText,
      provider,
      api_key: apiKey,
      azure_endpoint: azureEndpoint,
      azure_deployment: azureDeployment,
      azure_api_version: azureApiVersion,
    }),
  });

  return handleResponse(response);
}

export async function generateResume(data: GenerateRequest): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/api/generate-resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let message = `Generation failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // use default
    }
    throw new ApiError(message, response.status);
  }

  return response.blob();
}

export async function getApplications(
  status?: string
): Promise<Application[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') {
    params.set('status', status);
  }

  const url = `${BASE_URL}/api/applications${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);
  const data = await handleResponse<{applications: Application[], count: number}>(response);
  return data.applications;
}

export async function createApplication(
  data: Partial<Application>
): Promise<Application> {
  const response = await fetch(`${BASE_URL}/api/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function updateApplication(
  id: number,
  data: Partial<Application>
): Promise<Application> {
  const response = await fetch(`${BASE_URL}/api/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  return handleResponse(response);
}

export async function deleteApplication(id: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/applications/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    let message = `Delete failed (${response.status})`;
    try {
      const body = await response.json();
      message = body.detail || body.message || message;
    } catch {
      // use default
    }
    throw new ApiError(message, response.status);
  }
}
