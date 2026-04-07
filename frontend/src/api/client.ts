import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const baseURL = "http://localhost:8080/api";

const client = axios.create({ baseURL });

// Attaching token automatically
client.interceptors.request.use(
  (config) => {
    try {
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // silent fallback
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handling expired tokens globally
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired, logging out.");
      try {
        useAuthStore.getState().logout();
      } catch (e) {
        // ignore
      }
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

export default client;
