import React from "react";

// Admin top bar — own component on the $reg-* system, no longer piggybacking on the
// public landing nav. Rendered only inside server-protected admin pages.
const AdminNavbar = (props) => (
  <header className="adm-nav">
    <div className="adm-nav__brand">
      <span className="adm-nav__logo">RUIDEA</span>
      <span className="adm-nav__tag">Panel de administración</span>
    </div>
    <button type="button" className="adm-nav__logout" onClick={() => props.cerrarSesion()}>
      Cerrar sesión
    </button>
  </header>
);

export default AdminNavbar;
