import React from "react";
import { Link } from "react-router-dom";
import auth from "../../auth";

import wave1 from "../../img/waves1.svg";
import wave2 from "../../img/waves2.svg";
import imagenHero from "../../img/logoRuidea.webp";

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
            <img src={imagenHero} alt="Imagen Logo RUIDEA" />
          </div>
        </div>
      </section>
      <div className="waves">
        <img src={wave1} alt="Olas" />
        <img src={wave2} alt="Olas" className="second-wave" />
      </div>
    </main>
  );
};

export default Hero;
