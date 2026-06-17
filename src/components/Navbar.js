import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import auth from "../auth";
import { useAuthStatus } from "../useAuthStatus";

const Navbar = () => {
  const loggedIn = useAuthStatus();
  const onLanding = window.location.pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      const nav = document.querySelector("nav.lp-nav");
      if (nav) nav.classList.toggle("nav-scroll", window.pageYOffset > nav.clientHeight);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="lp-nav">
      <Link to="/" className="lp-nav__logo" role="button">
        RUIDEA
      </Link>
      <div className="lp-nav__right">
        {onLanding && (
          <a href="#que-es-ruidea" className="lp-nav__link">
            ¿Qué es RUIDEA?
          </a>
        )}
        {loggedIn ? (
          <Link to="/" className="lp-nav__logout" role="button" onClick={() => auth.logout(null)}>
            Cerrar sesión
          </Link>
        ) : (
          <>
            <Link to="/login" className="lp-nav__link">
              Iniciar sesión
            </Link>
            <Link to="/inscribirse" className="lp-btn lp-btn--primary lp-nav__cta" role="button">
              Inscribirme
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
