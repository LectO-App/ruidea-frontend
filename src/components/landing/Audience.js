import React from "react";

const DEAS = [
  { name: "Dislexia", text: "Dificultad en la lectura y la decodificación de palabras." },
  { name: "Discalculia", text: "Dificultad para comprender y operar con números." },
  { name: "Disortografía", text: "Dificultad en la escritura correcta de las palabras." },
  { name: "Dispraxia", text: "Dificultad en la coordinación y planificación de movimientos." },
  { name: "TDA-H", text: "Dificultades de atención, impulsividad y/o hiperactividad." },
];

const Audience = () => (
  <section className="lp-section lp-section--surface">
    <div className="lp-container">
      <span className="lp-eyebrow">¿Para quién es?</span>
      <h2 className="lp-section__title">
        Para personas con Dificultades Específicas del Aprendizaje
      </h2>
      <p className="lp-section__lead">
        Si tienes alguna de estas dificultades, puedes inscribirte en el registro y obtener tu
        pasaporte DEA.
      </p>

      <ul className="lp-deas">
        {DEAS.map((dea) => (
          <li className="lp-dea" key={dea.name}>
            <h3 className="lp-dea__name">{dea.name}</h3>
            <p className="lp-dea__text">{dea.text}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Audience;
