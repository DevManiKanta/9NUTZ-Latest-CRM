// src/lib/axios.ts
import axios, { AxiosError, AxiosInstance } from "axios";

// export const BASE_URL_1 = "http://192.168.29.8:8004/api";  
const BASE_URL_2 ="https://9nutsapi.nearbydoctors.in/public/api";
// const BASE_URL_2 ="https://confidays.nearbydoctors.in/public/api";
// const BASE_URL_2 ="https://api-mandala.nearbydoctors.in/public/api";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL_2,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token"); 
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);
api.interceptors.response.use(
  (resp) => resp,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("token"); 
        localStorage.removeItem("token"); 
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
