// Registers the service worker (src/service-worker.js) in production builds. The new worker
// activates at once (skipWaiting); when it takes control of a page that already had a
// worker, the page reloads so it runs the new build. /mostrar is not reloaded, because the
// holder may be showing the passport at that moment: the next page load uses the new build.
export const register = () => {
	if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
	const hadController = !!navigator.serviceWorker.controller;
	let reloaded = false;
	navigator.serviceWorker.addEventListener('controllerchange', () => {
		if (!hadController || reloaded || window.location.pathname === '/mostrar') return;
		reloaded = true;
		window.location.reload();
	});
	window.addEventListener('load', () => {
		navigator.serviceWorker.register(`${process.env.PUBLIC_URL}/service-worker.js`);
	});
};
