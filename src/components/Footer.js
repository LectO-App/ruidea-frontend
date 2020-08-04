import React from "react";

import { Link } from "react-router-dom";

import logoLecto from "../img/logo-lecto.webp";
import logoDisfam from "../img/logo-disfam.webp";

const Footer = () => {
  return (
    <footer>
      <div className="creado-por-lecto">
        <p>Sistema creado por el equipo de LectO</p>
        <div className="imagenes">
          <img src={logoLecto} className="imagen-lecto" alt="Logo LectO" />
          <img src={logoDisfam} className="imagen-disfam" alt="Logo Disfam" />
        </div>
      </div>
      <div className="links">
        <p>Política de protección de datos</p>
        <Link to="/inscribirse">Inscribirme</Link>
        <Link to="/dashboard">Ver estado de mi solicitud</Link>
      </div>
      <p className="copyright">
        &copy; 2020 RUIDEA. Todos los derechos reservados
      </p>
    </footer>
  );
};

export default Footer;
