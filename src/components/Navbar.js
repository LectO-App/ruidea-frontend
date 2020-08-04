import React from "react";
import { Link } from "react-router-dom";

import auth from "../auth";

const Navbar = (props) => {
  return (
    <nav>
      <Link to="/" className="logo-navbar">
        RUIDEA
      </Link>
      <div className="links">
        {window.location.pathname === "/" && (
          <a href="#que-es-ruidea">¿Qué es RUIDEA?</a>
        )}
        {auth.isAuthenticated() ? (
          <Link
            className="btn-cerrar-sesion"
            to="/"
            onClick={() => {
              auth.logout(null);
            }}
          >
            Cerrar sesión
          </Link>
        ) : (
          <Link to="/login" className="btn-iniciar-sesion">
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
