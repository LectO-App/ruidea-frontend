import React from "react";
import { Link } from "react-router-dom";
import { useAuthStatus } from "../../useAuthStatus";

const CtaBand = () => {
  const loggedIn = useAuthStatus();
  return (
    <section className="lp-cta-band">
      <div className="lp-container">
        <h2 className="lp-cta-band__title">
          {loggedIn ? "Continúa con tu solicitud" : "Obtén tu pasaporte DEA, gratis"}
        </h2>
        <p className="lp-cta-band__text">
          La inscripción y la emisión del documento no tienen ningún coste.
        </p>
        <Link
          to={loggedIn ? "/dashboard" : "/inscribirse"}
          className="lp-btn lp-btn--onfill"
          role="button"
        >
          {loggedIn ? "Ver mi solicitud" : "Inscribirme gratis"}
        </Link>
      </div>
    </section>
  );
};

export default CtaBand;
