import React from "react";

import AdminAuth from "./adminAuth";

const AdminNavbar = (props) => {
  return (
    <nav>
      <h2 className="logo-navbar">Rudea</h2>
      {AdminAuth.isAuthenticated() && (
        <div className="links">
          <p
            className="btn-cerrar-sesion"
            onClick={() => {
              props.cerrarSesion();
            }}
          >
            Cerrar sesión
          </p>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
