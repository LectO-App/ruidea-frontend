import React from "react";
import { Link } from "react-router-dom";
import { useAuthStatus } from "../useAuthStatus";

import logoLecto from "../img/webp/logo-lecto.webp";
import logoLectoPNG from "../img/png/logo-lecto.png";
import logoDisfam from "../img/webp/logo-disfam.webp";
import logoDisfamPNG from "../img/png/logo-disfam.png";

const Footer = () => {
  const loggedIn = useAuthStatus();
  return (
    <footer className="lp-footer">
      <div className="lp-footer__inner">
        <div className="lp-footer__top">
          <div className="lp-footer__brand">
            <span className="lp-footer__logo">RUIDEA</span>
            <p className="lp-footer__tagline">
              Registro Único Iberoamericano de personas con Dificultades Específicas del
              Aprendizaje.
            </p>
          </div>

          <nav className="lp-footer__links" aria-label="Enlaces del pie de página">
            <a href="#que-es-ruidea">¿Qué es RUIDEA?</a>
            <Link to="/verificar/numero">Verificar un pasaporte</Link>
            {loggedIn ? (
              <Link to="/dashboard">Ver mi solicitud</Link>
            ) : (
              <Link to="/login">Iniciar sesión</Link>
            )}
            <Link to="/politica-privacidad">Política de protección de datos</Link>
          </nav>
        </div>

        <div className="lp-footer__divider" />

        <div className="lp-footer__bottom">
          <span className="lp-footer__made">
            Sistema creado por el equipo de
            <picture>
              <source srcSet={logoLecto} type="image/webp" />
              <img src={logoLectoPNG} alt="LectO" />
            </picture>
            <picture>
              <source srcSet={logoDisfam} type="image/webp" />
              <img src={logoDisfamPNG} alt="DISFAM" />
            </picture>
          </span>
          <span className="lp-footer__copy">
            © {new Date().getFullYear()} RUIDEA. Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
