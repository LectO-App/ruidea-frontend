import React from "react";
import { MESES, isoToParts } from "../../util/identity";

// Date of birth as three labelled parts — Día (number), Mes (a list of month NAMES),
// Año (number) — instead of a calendar that opens on today and makes you page back
// decades (dyspraxia §2), or a bare numeric puzzle (dyscalculia §2). The parent step
// combines dia/mes/anio into an ISO date on submit (see partsToISODate).
const DateOfBirth = ({ register, errors, defaultISO, error }) => {
  const parts = isoToParts(defaultISO);
  const required = "Falta este dato";

  return (
    <fieldset className="dob">
      <legend>Fecha de nacimiento</legend>
      <div className="dob-parts">
        <div className="field dob-day">
          <label htmlFor="dia">Día</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            name="dia"
            id="dia"
            defaultValue={parts.dia}
            ref={register({ required })}
          />
        </div>
        <div className="field dob-month">
          <label htmlFor="mes">Mes</label>
          <select name="mes" id="mes" defaultValue={parts.mes} ref={register({ required })}>
            <option value="" disabled>
              Elige un mes
            </option>
            {MESES.map((mes, i) => (
              <option key={mes} value={i + 1}>
                {mes.charAt(0).toUpperCase() + mes.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="field dob-year">
          <label htmlFor="anio">Año</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            name="anio"
            id="anio"
            defaultValue={parts.anio}
            ref={register({ required })}
          />
        </div>
      </div>
      {(error || (errors && (errors.dia || errors.mes || errors.anio))) && (
        <span className="error-message" role="alert">
          {error || "Completa el día, el mes y el año"}
        </span>
      )}
    </fieldset>
  );
};

export default DateOfBirth;
