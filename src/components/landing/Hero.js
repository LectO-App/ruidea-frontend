import React from "react";
import { Link } from "react-router-dom";
import auth from "../../auth";

import wave1 from "../../img/svg/waves1.svg";
import wave1PNG from "../../img/png/waves1.png";
import wave2 from "../../img/svg/waves2.svg";
import wave2PNG from "../../img/png/waves2.png";
import logoRuidea from "../../img/svg/logo-ruidea.svg";
import logoRuideaPNG from "../../img/png/logo-ruidea.png";

const Hero = () => {
  let loggedIn = auth.isAuthenticated();

  return (
    <main>
      <section>
        <div className="hero">
          <div className="text">
            <h1>
              Registro Único Iberoamericano de personas con
              <span> Dificultades Específicas del Aprendizaje.</span>
            </h1>
            <Link
              role="button"
              to={loggedIn ? "/dashboard" : "/inscribirse"}
              className="btn-inscribirme"
            >
              {loggedIn ? "Ver mi solicitud" : "Inscribirme"}
            </Link>
          </div>
          <div className="imagen">
            <picture>
              <source srcSet={logoRuidea} />
              <img src={logoRuideaPNG} alt="Logo RUIDEA" />
            </picture>
          </div>
        </div>
      </section>

      <div className="waves">
        <picture>
          <source srcSet={wave1} />
          <img src={wave1PNG} alt="Primera Ola" />
        </picture>
        <picture>
          <source srcSet={wave2} />
          <img src={wave2PNG} alt="Segunda Ola" className="second-wave" />
        </picture>
      </div>
    </main>
  );
};

export default Hero;
