import React from "react";

// The five points a reviewer compares by eye between the application and the uploaded report.
// Answers live only in the detail screen's state: nothing is stored or sent.
export const CHECKS = [
  {
    key: "nombre",
    label: "Nombre completo",
    motivo: "El nombre completo no coincide con el del documento de identidad.",
  },
  {
    key: "documento",
    label: "DNI o documento",
    motivo: "El número del DNI o documento no coincide con el del documento de identidad.",
  },
  {
    key: "fechaNacimiento",
    label: "Fecha de nacimiento",
    motivo: "La fecha de nacimiento no coincide con la del documento de identidad.",
  },
  {
    key: "diagnostico",
    label: "Diagnóstico marcado",
    motivo: "El diagnóstico marcado no coincide con el del informe.",
  },
  {
    key: "firma",
    label: "Firma de un profesional con su n.º de colegiado",
    motivo: "El informe no tiene la firma de un profesional con su número de colegiado.",
  },
];

export const SI = "si";
export const NO = "no";

export const allMatch = (answers) => CHECKS.every((c) => answers[c.key] === SI);

export const motivosOf = (answers) => CHECKS.filter((c) => answers[c.key] === NO).map((c) => c.motivo);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
const CrossIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5l11 11m0-11-11 11" />
  </svg>
);

// `values` maps each check's key to what the applicant entered, shown beside the toggle.
const ReviewChecks = ({ answers, onAnswer, values }) => {
  const answered = CHECKS.filter((c) => answers[c.key]).length;
  return (
    <fieldset className="adm-checks">
      <legend className="adm-checks__legend">
        Compara con el documento{" "}
        <span className="adm-checks__count" role="status">
          · {answered} de {CHECKS.length}
        </span>
      </legend>
      <ul className="adm-checks__list">
        {CHECKS.map((c) => {
          const answer = answers[c.key];
          const labelId = `check-${c.key}`;
          return (
            <li key={c.key} className={`adm-check${answer === NO ? " is-no" : ""}`}>
              <div className="adm-check__text">
                <span className="adm-check__label" id={labelId}>
                  {c.label}
                </span>
                {values[c.key] && <span className="adm-check__value">{values[c.key]}</span>}
              </div>
              <div className="adm-toggle" role="group" aria-labelledby={labelId}>
                <button
                  type="button"
                  className="adm-toggle__btn is-yes"
                  aria-pressed={answer === SI}
                  onClick={() => onAnswer(c.key, SI)}
                >
                  <CheckIcon /> Coincide
                </button>
                <button
                  type="button"
                  className="adm-toggle__btn is-no"
                  aria-pressed={answer === NO}
                  onClick={() => onAnswer(c.key, NO)}
                >
                  <CrossIcon /> No
                </button>
              </div>
              {answer === NO && (
                <p className="adm-check__note">
                  Al pedir revisión, este motivo irá ya escrito en el mensaje: «{c.motivo}»
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
};

export default ReviewChecks;
