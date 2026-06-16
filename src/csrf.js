// Stores the CSRF token returned by the API (in the login/register/me response body).
// The API and SPA are on different domains, so the token can't ride in a JS-readable
// cookie — the SPA keeps it and echoes it in a header on every mutating request
// (SECURITY_ASSESSMENT.md §1.3/§9). localStorage lets it survive a page reload; it is
// not a session secret on its own (the httpOnly session cookie is).
const KEY = "ruidea-csrf";

let inMemory = null;

export const setCsrf = (token) => {
  if (!token) return;
  inMemory = token;
  try {
    window.localStorage.setItem(KEY, token);
  } catch (e) {
    /* storage unavailable */
  }
};

export const getCsrf = () => {
  if (inMemory) return inMemory;
  try {
    return window.localStorage.getItem(KEY);
  } catch (e) {
    return null;
  }
};

export const clearCsrf = () => {
  inMemory = null;
  try {
    window.localStorage.removeItem(KEY);
  } catch (e) {
    /* ignore */
  }
};
