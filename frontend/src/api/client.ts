import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const baseURL = import.meta.env.VITE_API_URL;

const client = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 10000,
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/signin";
    }

    if (status === 403) {
      console.warn("Access denied");
    }

    if (status >= 500) {
      console.error("Server error");
    }

    return Promise.reject(error);
  }
);

export default client;