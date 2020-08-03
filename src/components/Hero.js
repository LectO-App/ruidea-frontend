import React from "react";

import { Link } from "react-router-dom";

import wave1 from "../img/waves1.svg";
import wave2 from "../img/waves2.svg";
import imagenHero from "../img/logoHero.PNG";

const Hero = () => {
  return (
    <main>
      <section>
        <div className="hero">
          <div className="text">
            <h1>
              Registro Único Iberoamericano de personas con
              <span> Dificultades Específicas del Aprendizaje.</span>
            </h1>
            <Link to="inscribirse" className="btn-inscribirme">
              Inscribirme
            </Link>
          </div>
          <div className="imagen">
            <img src={imagenHero} alt="" />
          </div>
        </div>
      </section>
      <div className="waves">
        <img src={wave1} alt="" />
        <img src={wave2} alt="" className="second-wave" />
      </div>
    </main>
  );
};

export default Hero;
