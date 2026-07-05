import axios, { AxiosError, AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Custom Axios instance with common configurations
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};

    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request error]", error);

    return Promise.reject(error);
  },
);

// Response interceptor to standardize response format
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    console.error("[API Response error]", error?.response?.data);

    return Promise.reject(error?.response?.data);
  },
);

export { api };
