import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <h2>RUIDEA</h2>
      <div className="links">
        <a href="#que-es-rudea">¿Qué es RUIDEA?</a>
        <Link to="/login" className="btn-iniciar-sesion">
          Iniciar sesión
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
