const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Standard HTTP fetch helper with JSON error parsing and fallback handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errJson = await response.json();
        if (errJson.detail) errorMsg = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.warn(`[API Client] Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Base & Health
  getHealth: () => request('/health'),
  
  // Dashboard
  getDashboard: (projectId) => request(`/dashboard${projectId ? `?project_id=${projectId}` : ''}`),
  
  // Safety Monitoring
  analyzeSafety: async (formData) => {
    return request('/safety/analyze', {
      method: 'POST',
      body: formData, // FormData automatically sets multipart/form-data boundary
    });
  },
  getSafetyInspections: () => request('/safety/inspections'),

  // Structural Inspection
  analyzeStructural: async (formData) => {
    return request('/structural/analyze', {
      method: 'POST',
      body: formData,
    });
  },
  getStructuralInspections: () => request('/structural/inspections'),

  // Valuation
  estimateValuation: (data) => request('/valuation/estimate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  getValuationHistory: () => request('/valuation/history'),

  // Projects & Tasks
  getProjects: () => request('/projects'),
  getProjectById: (id) => request(`/projects/${id}`),
  createProject: (data) => request('/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),
  addTask: (projectId, data) => request(`/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),
  updateTaskProgress: (taskId, progressPct) => request(`/tasks/${taskId}?progress_pct=${progressPct}`, {
    method: 'PATCH',
  }),

  // AI Project Planner
  generatePlan: (data) => request('/planning/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  // Daily Site Assistant
  chatAssistant: (data) => request('/assistant/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }),

  // Weather Advisory
  getWeather: (location) => request(`/weather?location=${encodeURIComponent(location || 'Metro City')}`),

  // Knowledge Base
  getKnowledge: (query, category) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    return request(`/knowledge?${params.toString()}`);
  },

  // Reports
  getReports: (reportType) => request(`/reports${reportType ? `?report_type=${reportType}` : ''}`),
};
