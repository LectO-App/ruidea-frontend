import React from "react";

import { Link } from "react-router-dom";
import auth from "../auth";

import logoLecto from "../img/webp/logo-lecto.webp";
import logoLectoPNG from "../img/png/logo-lecto.png";
import logoDisfam from "../img/webp/logo-disfam.webp";
import logoDisfamPNG from "../img/png/logo-disfam.png";

const Footer = () => {
  return (
    <footer>
      <div className="creado-por-lecto">
        <p>Sistema creado por el equipo de LectO</p>
        <div className="imagenes">
          <picture>
            <source srcSet={logoLecto} />
            <img src={logoLectoPNG} alt="Logo LectO" className="imagen-lecto" />
          </picture>
          <picture>
            <source srcSet={logoDisfam} />
            <img
              src={logoDisfamPNG}
              alt="Logo Disfam"
              className="imagen-disfam"
            />
          </picture>
        </div>
      </div>
      <div className="links">
        <p role="button">Política de protección de datos</p>
        <Link to="/inscribirse" role="button">
          Inscribirme
        </Link>
        {auth.isAuthenticated() ? (
          <Link to="/dashboard" role="button">
            Ver estado de mi solicitud
          </Link>
        ) : (
          <Link to="/login" role="button">
            Iniciar sesión
          </Link>
        )}
      </div>
      <p className="copyright">
        &copy; 2020 RUIDEA. Todos los derechos reservados
      </p>
    </footer>
  );
};

export default Footer;
