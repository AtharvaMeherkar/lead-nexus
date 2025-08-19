import axios from "axios";

function resolveBaseURL(): string {
  const fromEnv = (import.meta as any).env?.VITE_API_BASE_URL as
    | string
    | undefined;
  if (fromEnv && fromEnv.startsWith("http")) return fromEnv;
  const loc = window.location;
  const host = loc.hostname || "localhost";
  return `http://${host}:5001`;
}

const api = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export default api;
