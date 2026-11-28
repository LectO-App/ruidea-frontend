/* eslint-disable no-restricted-globals */

// Built by react-scripts (workbox InjectManifest) into build/service-worker.js. It precaches
// the app shell and every build file, so RUIDEA pages, /mostrar included, open with no
// connection in a normal browser tab, installed or not. API calls are never cached: in
// production they go to /api on this origin and are left to the network.
import { clientsClaim } from 'workbox-core';
import { createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';

// A new build takes over as soon as it is installed, so nobody stays on an old build.
// serviceWorkerRegistration.js reloads open pages once it does (except /mostrar).
self.skipWaiting();
clientsClaim();

// The ~500 country flags of flag-icon-css (about 6 MB) are left out: only the registration
// form shows them, and it needs a connection anyway.
const flagIcon = /^\/static\/media\/[a-z]{2}(-[a-z]+)?\.[0-9a-f]+\.svg$/;
precacheAndRoute(self.__WB_MANIFEST.filter(entry => !flagIcon.test(entry.url)));

// Page navigations get the cached index.html; the router shows the route. Not /api/ (the
// API proxy), not /_ paths and not file URLs.
const fileExtension = /\/[^/?]+\.[^/]+$/;
registerRoute(({ request, url }) => {
	if (request.mode !== 'navigate') return false;
	if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_')) return false;
	return !fileExtension.test(url.pathname);
}, createHandlerBoundToURL(`${process.env.PUBLIC_URL}/index.html`));
