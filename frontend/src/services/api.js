/**
 * API Service for PCOSense Backend
 * Provides robust connection with multiple host candidate fallbacks,
 * clear diagnostic error messages, and Vite dev-proxy compatibility.
 */

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Resolve candidate URLs in order of preference:
 * 1. Explicit VITE_API_URL if configured
 * 2. Same-origin '/api' (proxied by Vite to http://127.0.0.1:8000 during dev)
 * 3. Direct http://127.0.0.1:8000
 * 4. Direct http://localhost:8000
 */
export function getBaseCandidates() {
  if (import.meta.env.VITE_API_URL) {
    return [import.meta.env.VITE_API_URL];
  }

  const candidates = [];
  if (typeof window !== 'undefined') {
    // In Vite development, /api is reverse-proxied to 127.0.0.1:8000
    if (import.meta.env.DEV) {
      candidates.push('/api');
    }
    const host = window.location.hostname || '127.0.0.1';
    candidates.push(`http://${host}:8000`);
    if (host !== '127.0.0.1') {
      candidates.push('http://127.0.0.1:8000');
    }
    if (host !== 'localhost') {
      candidates.push('http://localhost:8000');
    }
  } else {
    candidates.push('http://127.0.0.1:8000');
  }

  return candidates;
}

/**
 * Check health status of the screening backend
 */
export async function checkBackendHealth() {
  const candidates = getBaseCandidates();
  let lastError = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        return { ...data, endpoint: baseUrl };
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.warn('[PCOS API] Health check failed for all candidates:', lastError);
  throw new ApiError(
    'Cannot connect to screening server. Please verify the FastAPI backend is running on port 8000.',
    0,
    lastError?.message
  );
}

/**
 * Fetch model information and metrics
 */
export async function fetchModelInfo() {
  const candidates = getBaseCandidates();
  let lastError = null;

  for (const baseUrl of candidates) {
    try {
      const response = await fetch(`${baseUrl}/model-info`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      lastError = err;
    }
  }

  console.warn('[PCOS API] Failed to fetch model info from candidates:', lastError);
  throw new ApiError(
    'Failed to retrieve model information. Backend server is unavailable.',
    0,
    lastError?.message
  );
}

/**
 * Submit screening questionnaire data for risk prediction
 * @param {Object} formData Form data matching expected schema
 */
export async function submitScreeningData(formData) {
  const candidates = getBaseCandidates();
  let lastError = null;

  console.info('[PCOS Screening API] Initiating risk prediction with candidates:', candidates);

  for (const baseUrl of candidates) {
    try {
      console.info(`[PCOS Screening API] Trying endpoint: ${baseUrl}/predict`);
      const response = await fetch(`${baseUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { detail: text };
        }
      }

      if (!response.ok) {
        // Pydantic validation error
        if (response.status === 422) {
          const details = Array.isArray(data?.detail)
            ? data.detail.map(d => `${d.loc ? d.loc.join('.') : 'field'}: ${d.msg}`).join(', ')
            : (data?.detail || 'Input validation failed.');
          console.error('[PCOS Screening API] Validation error (422):', details, data?.detail);
          throw new ApiError(`Validation error: ${details}`, 422, data?.detail);
        }

        // Vite proxy failure when backend is down
        if (response.status === 502 || response.status === 504) {
          throw new ApiError(
            `Gateway error (${response.status}): The backend screening server is not responding on port 8000.`,
            response.status
          );
        }

        throw new ApiError(
          data?.detail || `Prediction request failed (HTTP ${response.status})`,
          response.status,
          data
        );
      }

      console.info('[PCOS Screening API] Prediction successful:', data);
      return data;
    } catch (err) {
      lastError = err;
      console.warn(`[PCOS Screening API] Attempt via ${baseUrl} failed:`, err.message);

      // Do not attempt other endpoints on 422 validation errors (the input itself was rejected)
      if (err instanceof ApiError && err.status === 422) {
        throw err;
      }
    }
  }

  // If all candidate endpoints failed
  console.error('[PCOS Screening API] All backend candidate endpoints failed:', lastError);
  if (lastError instanceof ApiError) {
    throw lastError;
  }

  throw new ApiError(
    'Unable to communicate with the screening service. Please verify the FastAPI backend is running on port 8000 (e.g., python -m uvicorn backend.main:app --port 8000).',
    0,
    lastError?.message
  );
}
