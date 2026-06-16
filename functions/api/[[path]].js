/**
 * Cloudflare Pages Function — same-origin API proxy.
 *
 * The browser calls https://pasaporte.dea.ong/api/*  and this forwards it to the backend at
 * https://ruidea.azurewebsites.net/* . Because the browser only ever sees pasaporte.dea.ong,
 * the httpOnly session cookie is FIRST-PARTY — which is what makes login work in Safari/iOS,
 * where third-party cookies are blocked outright regardless of SameSite=None.
 *
 * The backend sets a host-only cookie (no Domain attribute), so the browser scopes it to
 * pasaporte.dea.ong automatically. No backend change required.
 */

const BACKEND = "https://ruidea.azurewebsites.net";

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Strip the /api prefix; keep the rest of the path and the query string.
  const path = url.pathname.replace(/^\/api/, "") || "/";
  const target = BACKEND + path + url.search;

  // Copy method, headers, and body onto the new URL. fetch() recomputes the upstream Host,
  // and Set-Cookie / status / body from the backend pass straight back to the browser.
  const proxied = new Request(target, request);

  return fetch(proxied);
}
