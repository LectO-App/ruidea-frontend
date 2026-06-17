import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import "../css/registration.scss";

// Loading placeholder for /inscribirse. Used both as the route-level Suspense fallback
// (while the lazy Form chunk downloads) and inside Form while the initial getOwn() fetch
// resolves — so the experience is one continuous skeleton, never a full-screen spinner.
// We already know the page chrome (close button, progress frame, card); only the step
// content is unknown, so only that is skeletonized. Layout matches the loaded form, so
// nothing reflows when real content arrives. Shimmer pauses under prefers-reduced-motion.
const RegistrationSkeleton = () => (
  <div className="reg">
    <Helmet>
      <meta charSet="utf-8" />
      <title>Inscribirse | RUIDEA</title>
    </Helmet>

    <Link className="reg-close" to="/" aria-label="Cerrar y volver al inicio" role="button" />

    <div className="reg-shell" aria-busy="true" aria-live="polite">
      <span className="sk-sr">Cargando el formulario…</span>

      <header className="reg-progress" aria-hidden="true">
        <p className="reg-step-count">
          <span className="sk sk-step-count" />
        </p>
        <div className="reg-bar">
          <span className="reg-bar-fill sk-bar-fill" />
        </div>
        <div className="sk sk-title" />
      </header>

      <div className="reg-step" aria-hidden="true">
        <div className="step-form">
          <div className="sk sk-intro" />
          {[0, 1, 2].map((i) => (
            <div className="sk-field" key={i}>
              <div className="sk sk-label" />
              <div className="sk sk-input" />
            </div>
          ))}
          <div className="sk sk-button" />
        </div>
      </div>
    </div>
  </div>
);

export default RegistrationSkeleton;
