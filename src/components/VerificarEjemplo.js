import React, { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

import logoDisfam from "../img/webp/logo-disfam.webp";
import logoDisfamPNG from "../img/png/logo-disfam.png";

import logoRuidea from "../img/svg/logo-ruidea.svg";
import logoRuideaPNG from "../img/png/logo-ruidea.png";

const Verificar = (props) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      <header className="header-verificar">
        <p className="pais">España</p>
        <h1>PASAPORTE DEA</h1>
        <a href="https://disfam.org" target="_blank" rel="noopener noreferrer">
          <picture>
            <source srcSet={logoDisfam} type="image/webp" />
            <img
              src={logoDisfamPNG}
              alt="Ícono Disfam"
              className="logo-disfam"
            />
          </picture>
        </a>
      </header>

      <main className="main-verificar">
        <h2 className="pasaporte">Pasaporte N° 00123456</h2>
        <div className="flex">
          <div className="container-logo-ruidea">
            <picture>
              <source srcSet={logoRuidea} type="image/svg+xml" />
              <img
                src={logoRuideaPNG}
                alt="Logo RUIDEA"
                className="logo-ruidea"
              />
            </picture>
          </div>
          <div className="container-datos">
            <div className="texto-main">
              <h1>Hugo Salas Ocaña</h1>
              <h3>12/04/2017</h3>
              <h2>12180427Z</h2>
            </div>
          </div>
        </div>
        <h2 className="desarrollado-por-lecto">
          Sistema desarrollado por el equipo de{" "}
          <a href="https://lecto.app" target="_blank" rel="noopener noreferrer">
            LectO
          </a>
        </h2>
      </main>
      <footer className="footer-verificar">
        <p>
          Rogamos tengan en consideración las circunstancias que concurren en la
          persona portadora de este documento, asi cómo los derechos recogidos en
          la legislación vigente
        </p>
      </footer>
    </>
  );
};

export default Verificar;
