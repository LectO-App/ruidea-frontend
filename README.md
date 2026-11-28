This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

## Analytics

The site uses Cloudflare Web Analytics, which sets no cookies. Set `REACT_APP_CF_BEACON_TOKEN` at build time to the Web Analytics site token (Cloudflare dashboard → Analytics & Logs → Web Analytics); leave it unset in development, and nothing is loaded.

The beacon reports each page's path (not its query string or hash) and its referrer. Token pages (`/verificar/…`, `/verificarEmail/…`, `/cambiarContraseña/…`) must never be reported, so `src/analytics.js` does not load the beacon on them or on a page they linked to, and turns an in-app move to one of them into a full page load that drops the beacon.

## Offline passport

Production builds register a Workbox service worker (`src/service-worker.js`). It precaches the app shell and every build file, so the pages open with no connection in a normal browser tab. Installing the PWA is not needed. API calls (`/api/*`) are never cached.

- Updates: a new worker activates at once (`skipWaiting`). Open pages reload when it takes control, except `/mostrar`, which picks up the new build on its next load.
- Each successful `GET /usuario/me` for an approved holder saves a copy of the passport in `localStorage` (`src/util/offlinePassport.js`): the name, the padded number, the share link and the save time. Nothing else.
- The copy is deleted when the holder is no longer approved, when `/usuario/me` answers 404, on logout and by «Quitar de este móvil». A 401 keeps it, because an expired session is a time the holder may still need it.
- Safari on iPhone deletes a site's storage after about 7 days without a visit unless it is on the home screen. The approval email carries the passport card as the fallback.
