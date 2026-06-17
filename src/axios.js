import axios from "axios";
import { getCsrf, setCsrf } from "./csrf";

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

// Capture a refreshed CSRF token whenever the server returns one (login, register,
// /me, /admin/me) so it stays valid across reloads and re-logins.
axiosInstance.interceptors.response.use(
  function (response) {
    if (response.data && response.data.csrfToken) {
      setCsrf(response.data.csrfToken);
    }
    return response;
  },
  function (error) {
    return Promise.reject(error);
  }
);
