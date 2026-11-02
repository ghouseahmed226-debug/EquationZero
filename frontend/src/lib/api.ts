import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('eq0_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// API helper functions
export const api = {
  // Health
  checkHealth: async () => {
    const res = await apiClient.get('/health');
    return res.data;
  },

  // Auth
  register: async (data: { email: string; username: string; password: string; full_name?: string }) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await apiClient.post('/auth/login', data);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Projects
  getProjects: async () => {
    const res = await apiClient.get('/projects');
    return res.data;
  },
  createProject: async (data: { name: string; description?: string; domain?: string }) => {
    const res = await apiClient.post('/projects', data);
    return res.data;
  },
  getProject: async (id: string) => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data;
  },

  // Datasets
  uploadDataset: async (projectId: string, formData: FormData) => {
    const res = await apiClient.post(`/datasets/${projectId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  getDatasets: async (projectId: string) => {
    const res = await apiClient.get(`/datasets/project/${projectId}/list`);
    return res.data;
  },
  getDataset: async (id: string) => {
    const res = await apiClient.get(`/datasets/${id}`);
    return res.data;
  },
  getDatasetPreview: async (id: string, rows: number = 30) => {
    const res = await apiClient.get(`/datasets/${id}/preview?n_rows=${rows}`);
    return res.data;
  },
  getDatasetAnalysis: async (id: string) => {
    const res = await apiClient.get(`/datasets/${id}/analysis`);
    return res.data;
  },
  createSyntheticDataset: async (name: string, projectId: string, samples: number = 200) => {
    const res = await apiClient.post(`/datasets/synthetic/${name}?project_id=${projectId}&n_samples=${samples}`);
    return res.data;
  },

  // Discoveries
  createDiscovery: async (data: any) => {
    const res = await apiClient.post('/discoveries', data);
    return res.data;
  },
  getDiscovery: async (id: string) => {
    const res = await apiClient.get(`/discoveries/${id}`);
    return res.data;
  },
  getDiscoveries: async (projectId: string) => {
    const res = await apiClient.get(`/discoveries/project/${projectId}/list`);
    return res.data;
  },
  verifyDiscovery: async (discoveryId: string, equationIdx: number) => {
    const res = await apiClient.post(`/discoveries/${discoveryId}/verify`, {
      equation_idx: equationIdx,
      test_fraction: 0.2,
      n_bootstrap: 100,
    });
    return res.data;
  },
  getDiscoveryReport: async (discoveryId: string) => {
    const res = await apiClient.get(`/discoveries/${discoveryId}/report`);
    return res.data;
  },

  // Benchmarks
  getBenchmarks: async () => {
    const res = await apiClient.get('/benchmarks');
    return res.data;
  },
  previewBenchmark: async (name: string) => {
    const res = await apiClient.get(`/benchmarks/${name}/preview`);
    return res.data;
  },
};
