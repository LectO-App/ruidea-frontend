import React from "react";
import { Helmet } from "react-helmet-async";

import Navbar from "./Navbar";

// Loading placeholder for the dashboard. Used by the route guard (while the session check
// and lazy chunk resolve) and inside Dashboard (while /usuario/me loads) so the page is one
// continuous skeleton instead of stacked full-screen spinners. The navbar is real chrome we
// already have; only the greeting and status card — which depend on the fetch — are
// skeletonized. Layout matches the loaded view so nothing reflows. Shimmer pauses under
// prefers-reduced-motion (see skeleton.scss).
const DashboardSkeleton = () => (
  <div className="dashboard-div-main">
    <Helmet>
      <meta charSet="utf-8" />
      <title>Mi panel | RUIDEA</title>
    </Helmet>

    <Navbar />

    <main className="dash" aria-busy="true" aria-live="polite">
      <div className="dash-shell">
        <span className="sk-sr">Cargando tu panel…</span>

        <p className="dsk-greeting" aria-hidden="true">
          <span className="sk" />
        </p>

        <div className="dsk-card" aria-hidden="true">
          <span className="sk dsk-badge" />
          <span className="sk dsk-card-title" />
          <span className="sk dsk-line" />
          <span className="sk dsk-line short" />
          <div className="dsk-actions">
            <span className="sk" />
            <span className="sk" />
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default DashboardSkeleton;
