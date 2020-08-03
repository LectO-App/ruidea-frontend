import React from "react";

import imagenHero from "../img/logoHero.PNG";

const Info = () => {
  return (
    <section className="section-que-es-rudea" id="que-es-rudea">
      <div className="titulo">
        <h1>Que es Rudea?</h1>
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
