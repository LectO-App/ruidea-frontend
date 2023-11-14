import React from "react";

import logoAirEuropa from "../../img/png/air-europa.png";
import logoDgt from "../../img/png/dgt.png";
import logoMinEdu from "../../img/png/ministerio-educacion.png";
import logoOEI from "../../img/png/oei.png";
import logoGuardiaCivil from "../../img/png/guardia-civil.png";

const Acknowledgements = () => {
  return (
    <section className="section-que-es-ruidea">
      <div className="titulo-info">
        <h1>Con el apoyo de:</h1>
      </div>

      <div className="logos">
        <a href="https://www.oei.es/" target="_blank" rel="noopener noreferrer">
          <img
            src={logoOEI}
            alt="Logo Organización de Estados Interamericanos (OEI)"
            className="logo"
          />
        </a>

        <a
          href="https://www.aireuropa.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={logoAirEuropa} alt="Logo Air Europa" className="logo" />
        </a>

        <a href="https://www.dgt.es/" target="_blank" rel="noopener noreferrer">
          <img
            src={logoDgt}
            alt="Logo Dirección General de Tráfico (DGT)"
            className="logo"
          />
        </a>
        <a
          href="https://www.educacionyfp.gob.es/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={logoMinEdu}
            alt="Logo Ministerio de Educación y Formación Profesional"
            className="logo"
          />
        </a>
        <a
          href="https://www.guardiacivil.es/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={logoGuardiaCivil}
            alt="Logo Guardia Civil"
            className="logo"
          />
        </a>
      </div>
    </section>
  );
};

export default Acknowledgements;
