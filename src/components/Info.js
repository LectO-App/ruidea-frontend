import React from "react";

import imagenHero from "../img/logoRuidea.webp";

const Info = () => {
  return (
    <section className="section-que-es-ruidea" id="que-es-ruidea">
      <div className="titulo-info">
        <h1>Que es RUIDEA?</h1>
        <p>Lorem ipsum dolor sit amet consectetur illum detectus.</p>
      </div>

      <div>
        <div className="item">
          <div className="container-imagen">
            <img src={imagenHero} alt="" />
          </div>
          <div className="container-texto">
            <h2>¿Cómo funciona?</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis
              nulla rhoncus sapien fermentum diam. Ut duis libero in aliquam
              lectus sagittis diam sit.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Info;
