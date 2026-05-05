import axios from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = sessionStorage.getItem('refresh_token');
      if (!refreshToken) {
        sessionStorage.clear();
        window.location.href = '/#/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );
        sessionStorage.setItem('access_token', data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return httpClient(original);
      } catch {
        sessionStorage.clear();
        window.location.href = '/#/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
