
import axios from "axios";
import { auth } from "../firebase.js";

const baseURL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const api = axios.create({
  baseURL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const currentUser = auth?.currentUser;

    if (currentUser) {
      try {
        const token = await currentUser.getIdToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        delete config.headers?.Authorization;
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      (error?.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : !error?.response
          ? "Unable to connect to the server. Check your connection and try again."
          : "Something went wrong. Please try again.");

    error.userMessage = message;

    if (error?.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("urlink:unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default api;
