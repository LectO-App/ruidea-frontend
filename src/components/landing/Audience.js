import React from "react";
import { DEAS } from "../../util/deas";

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
          <li className="lp-dea" key={dea.key}>
            <h3 className="lp-dea__name">{dea.name}</h3>
            <p className="lp-dea__text">{dea.text}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

export default Audience;
