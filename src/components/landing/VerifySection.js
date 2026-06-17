import React from "react";
import { Link } from "react-router-dom";

// Secondary audience: administrations / authorities who need to verify a passport.
const VerifySection = () => (
  <section className="lp-section">
    <div className="lp-container lp-verify">
      <div className="lp-verify__copy">
        <span className="lp-eyebrow">Para administraciones y autoridades</span>
        <h2 className="lp-section__title">Verifica un pasaporte en segundos</h2>
        <p className="lp-section__lead">
          Comprueba la autenticidad de cualquier pasaporte DEA introduciendo su número de
          documento o escaneando el código QR del propio documento.
        </p>
        <div className="lp-verify__cta">
          <Link to="/verificar/numero" className="lp-btn lp-btn--primary">
            Verificar un pasaporte
          </Link>
          <Link to="/verificar/ejemplo" className="lp-btn lp-btn--ghost">
            Ver un ejemplo
          </Link>
        </div>
      </div>

      <div className="lp-verify__visual" aria-hidden="true">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <rect width="120" height="120" rx="16" fill="#fff" />
          <rect x="14" y="14" width="30" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="7" />
          <rect x="76" y="14" width="30" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="7" />
          <rect x="14" y="76" width="30" height="30" rx="5" fill="none" stroke="currentColor" strokeWidth="7" />
          <g fill="currentColor">
            <rect x="54" y="16" width="7" height="7" />
            <rect x="64" y="26" width="7" height="7" />
            <rect x="54" y="36" width="7" height="7" />
            <rect x="54" y="54" width="7" height="7" />
            <rect x="66" y="54" width="7" height="7" />
            <rect x="78" y="60" width="7" height="7" />
            <rect x="92" y="66" width="7" height="7" />
            <rect x="56" y="68" width="7" height="7" />
            <rect x="68" y="80" width="7" height="7" />
            <rect x="82" y="84" width="7" height="7" />
            <rect x="96" y="90" width="7" height="7" />
            <rect x="58" y="92" width="7" height="7" />
            <rect x="72" y="98" width="7" height="7" />
          </g>
        </svg>
      </div>
    </div>
  </section>
);

export default VerifySection;
