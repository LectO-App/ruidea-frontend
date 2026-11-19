import React from "react";
import { NavLink } from "react-router-dom";

// Admin top bar — own component on the $reg-* system, no longer piggybacking on the
// public landing nav. Rendered only inside server-protected admin pages.
const AdminNavbar = (props) => (
  <header className="adm-nav">
    <div className="adm-nav__brand">
      <span className="adm-nav__logo">RUIDEA</span>
      <span className="adm-nav__tag">Panel de administración</span>
    </div>
    <nav className="adm-nav__links" aria-label="Secciones del panel">
      <NavLink to="/admin/solicitudes" className="adm-nav__link" activeClassName="is-active">
        Solicitudes
      </NavLink>
      <NavLink to="/admin/estadisticas" className="adm-nav__link" activeClassName="is-active">
        Estadísticas
      </NavLink>
    </nav>
    <button type="button" className="adm-nav__logout" onClick={() => props.cerrarSesion()}>
      Cerrar sesión
    </button>
  </header>
);

export default AdminNavbar;
