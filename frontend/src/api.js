const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Wakes up the backend if it's sleeping (Render free tier cold start)
export async function warmUp() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);
    await fetch(`${BASE_URL}/health`, { signal: controller.signal });
    clearTimeout(timer);
  } catch {}
}

function fetchWithTimeout(url, options = {}, ms = 60000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

async function request(path, options = {}) {
  const res = await fetchWithTimeout(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }, 60000);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  /**
   * Scrape with live SSE progress.
   * @param {string} query
   * @param {number} maxResults
   * @param {function} onEvent - called with each SSE event object
   * @returns {Promise<{added, skipped, query}>}
   */
  scrapeStream: (query, maxResults, onEvent) => {
    return new Promise((resolve, reject) => {
      const url = `${BASE_URL}/api/scrape-stream?query=${encodeURIComponent(query)}&maxResults=${maxResults}`;
      const es = new EventSource(url);

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          onEvent(data);
          if (data.type === 'done') {
            es.close();
            resolve(data);
          }
          if (data.type === 'error') {
            es.close();
            reject(new Error(data.message));
          }
        } catch {}
      };

      es.onerror = () => {
        es.close();
        reject(new Error('Connection lost'));
      };
    });
  },

  getLeads: () => request('/api/leads'),

  updateLead: (id, data) =>
    request(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  deleteLead: (id) =>
    request(`/api/leads/${id}`, { method: 'DELETE' }),

  getStats: () => request('/api/stats'),
};
