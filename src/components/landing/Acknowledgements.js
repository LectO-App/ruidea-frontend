import React from "react";

import logoAirEuropa from "../../img/png/air-europa.png";
import logoDgt from "../../img/png/dgt.png";
import logoMinEdu from "../../img/png/ministerio-educacion.png";
import logoOEI from "../../img/png/oei.png";
import logoGuardiaCivil from "../../img/png/guardia-civil.png";

const PARTNERS = [
  { src: logoOEI, alt: "Organización de Estados Iberoamericanos (OEI)", href: "https://www.oei.es/" },
  { src: logoMinEdu, alt: "Ministerio de Educación y Formación Profesional", href: "https://www.educacionyfp.gob.es/" },
  { src: logoDgt, alt: "Dirección General de Tráfico (DGT)", href: "https://www.dgt.es/" },
  { src: logoGuardiaCivil, alt: "Guardia Civil", href: "https://www.guardiacivil.es/" },
  { src: logoAirEuropa, alt: "Air Europa", href: "https://www.aireuropa.com" },
];

const Acknowledgements = () => (
  <section className="lp-section lp-section--surface">
    <div className="lp-container lp-trust">
      <span className="lp-eyebrow">Con el apoyo de</span>
      <h2 className="lp-section__title">Respaldado por instituciones de Iberoamérica</h2>
      <p className="lp-section__lead">
        Los Ministerios de Educación de la gran mayoría de países iberoamericanos brindaron su
        apoyo unánime en la Comisión Iberoamericana de Dislexia y otras DEA, celebrada el 13 de
        noviembre de 2020.
      </p>

      <ul className="lp-trust__logos">
        {PARTNERS.map((p) => (
          <li key={p.href}>
            <a href={p.href} target="_blank" rel="noopener noreferrer" aria-label={p.alt}>
              <img src={p.src} alt={p.alt} loading="lazy" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Acknowledgements;
