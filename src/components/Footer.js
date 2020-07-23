import React from "react";

import logoLecto from "../img/logo-lecto.png";
import logoDisfam from "../img/logo-disfam.png";

const Footer = () => {
  return (
    <footer>
      <div className="creado-por-lecto">
        <p>Sistema creado por el equipo de LectO</p>
        <div className="imagenes">
          <img src={logoLecto} alt="Logo LectO" />
          <img src={logoDisfam} alt="Logo Disfam" />
        </div>
      </div>
      <div className="links">
        <p>Política de protección de datos</p>
        <p>Inscribirme</p>
        <p>Ver estado de mi solicitud</p>
      </div>
      <p className="copyright">
        &copy; 2020 Rudea. Todos los derechos reservados
      </p>
    </footer>
  );
};

export default Footer;
