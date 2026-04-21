const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
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
