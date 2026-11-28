import React from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { loadBeacon } from "./analytics";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import "./css/style.scss";

loadBeacon();

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.register();
