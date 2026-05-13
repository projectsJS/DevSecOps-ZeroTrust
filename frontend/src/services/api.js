import axios from "axios";
import { clearToken, getToken } from "./tokenStorage";

const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  return envUrl && envUrl.trim().length > 0
    ? envUrl
    : "http://localhost:5000";
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 8000,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new CustomEvent("auth:invalid"));
    }
    return Promise.reject(error);
  }
);

export { getApiBaseUrl };
export default api;
