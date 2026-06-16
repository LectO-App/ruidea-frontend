import React from "react";

// "¿Qué es RUIDEA?" — the navbar anchor target. scroll-margin-top (in landing.scss)
// offsets the sticky navbar instead of the old empty-div + negative-margin hack.
const About = () => (
  <section className="lp-section lp-section--surface" id="que-es-ruidea">
    <div className="lp-container">
      <span className="lp-eyebrow">¿Qué es RUIDEA?</span>
      <h2 className="lp-section__title">
        Un documento verificado que hace valer tus derechos
      </h2>
      <p className="lp-section__lead">
        RUIDEA es el Registro Único Iberoamericano con el que las personas con Dificultades
        Específicas del Aprendizaje obtienen un pasaporte digital verificado. Con él, las
        administraciones y autoridades pueden tener en consideración la legislación vigente y
        las circunstancias que concurren en la persona portadora.
      </p>
      <p className="lp-section__muted">
        Emitido por la Organización Iberoamericana DISFAM, único representante del colectivo en
        la gran mayoría de países iberoamericanos.
      </p>
    </div>
  </section>
);

export default About;
