import axios from "axios";
import { getCsrf, setCsrf } from "./csrf";
import { syncOfflinePassport, clearOfflinePassport } from "./util/offlinePassport";

// Auth is now a server-side httpOnly session cookie — no public API key in the bundle
// (SECURITY_ASSESSMENT.md §1.1). `withCredentials` sends the cookie cross-origin; the
// CSRF token (returned in auth/me response bodies) is echoed back in a header on
// mutating requests.
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  withCredentials: true,
});

const MUTATING = ["post", "put", "patch", "delete"];

axiosInstance.interceptors.request.use(
  function (config) {
    const method = (config.method || "get").toLowerCase();
    if (MUTATING.includes(method)) {
      const csrf = getCsrf();
      if (csrf) {
        config.headers = { ...config.headers, "X-CSRF-Token": csrf };
      }
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

const isMe = (config) => !!config && config.url === "/usuario/me";

// Capture a refreshed CSRF token whenever the server returns one (login, register,
// /me, /admin/me) so it stays valid across reloads and re-logins. Every /usuario/me answer
// also refreshes or deletes the passport copy kept for offline use; a 401 keeps it, since
// an expired session is exactly when the holder may still need it.
axiosInstance.interceptors.response.use(
  function (response) {
    if (response.data && response.data.csrfToken) {
      setCsrf(response.data.csrfToken);
    }
    if (isMe(response.config)) syncOfflinePassport(response.data);
    return response;
  },
  function (error) {
    if (isMe(error.config) && error.response && error.response.status === 404) clearOfflinePassport();
    return Promise.reject(error);
  }
);
