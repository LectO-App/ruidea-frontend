import { useEffect } from "react";
import { useHistory } from "react-router-dom";

// Cloudflare Web Analytics (cookieless). Its beacon reports the page URL without the query
// string or hash, but with the full path, and the referrer. Paths that carry a live token
// or personal data must never be reported (SECURITY_ASSESSMENT.md §10.3), and the beacon
// cannot rewrite the path, so:
//   - it is not loaded when the page, or the same-origin page that linked to it, is one of
//     those paths;
//   - once loaded, an in-app navigation to one of those paths is turned into a full page
//     load, which drops the beacon, instead of a history change the beacon would report.
// REACT_APP_CF_BEACON_TOKEN is the Web Analytics site token; unset (as in dev) loads nothing.

const SENSITIVE = ["/verificar/", "/cambiarContrase", "/verificarEmail/", "/entrar/"];
const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

export const isSensitivePath = (path) => SENSITIVE.some((p) => path.startsWith(p));

const sameOriginReferrerPath = () => {
  try {
    const url = new URL(document.referrer);
    return url.origin === window.location.origin ? url.pathname : "";
  } catch {
    return "";
  }
};

const beaconLoaded = () => Boolean(document.querySelector("script[data-cf-beacon]"));

export function loadBeacon(token = process.env.REACT_APP_CF_BEACON_TOKEN) {
  if (!token || beaconLoaded()) return;
  if (isSensitivePath(window.location.pathname) || isSensitivePath(sameOriginReferrerPath())) return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = BEACON_SRC;
  script.setAttribute("data-cf-beacon", JSON.stringify({ token, spa: true }));
  document.head.appendChild(script);
}

const fullPageLoad = (url) => window.location.assign(url);

export function BeaconRouteGuard({ navigate = fullPageLoad }) {
  const history = useHistory();
  useEffect(() => {
    if (!beaconLoaded()) return undefined;
    return history.block((location) => {
      if (!isSensitivePath(location.pathname)) return undefined;
      navigate(history.createHref(location));
      return false;
    });
  }, [history, navigate]);
  return null;
}
