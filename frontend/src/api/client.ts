import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const tokenStorage = {
  getAccessToken: () => localStorage.getItem('hidaya_sems_access_token'),
  getRefreshToken: () => localStorage.getItem('hidaya_sems_refresh_token'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('hidaya_sems_access_token', access);
    localStorage.setItem('hidaya_sems_refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('hidaya_sems_access_token');
    localStorage.removeItem('hidaya_sems_refresh_token');
  },
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStorage.getRefreshToken();
  if (!refresh) return null;

  const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, { refresh });
  const access = response.data?.access;
  if (access) {
    localStorage.setItem('hidaya_sems_access_token', access);
    return access;
  }
  return null;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      refreshPromise = refreshPromise || refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newAccess = await refreshPromise;
      if (newAccess) {
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        return apiClient(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);
