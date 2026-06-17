import React from "react";
import { BsCheckCircle } from "react-icons/bs";

// Diagnosis as large, tappable cards (not tiny checkboxes — dyspraxia §2/§3), inside a
// fieldset. Fully CONTROLLED: `value` is { name: bool } and every toggle reports the next
// object up via onChange. (An earlier version defined the card as a nested component and
// used uncontrolled defaultChecked, which remounted the inputs on every render — that's
// why selecting didn't stick and revisiting checked everything.)
const CONDICIONES = [
  { name: "dislexia", label: "Dislexia" },
  { name: "discalculia", label: "Discalculia" },
  { name: "disortografía", label: "Disortografía" },
  { name: "dispraxia", label: "Dispraxia" },
  { name: "tdah", label: "TDA-H" },
];

const DiagnosisCards = ({ value = {}, onChange, error }) => {
  const toggle = (name) => onChange({ ...value, [name]: !value[name] });

  return (
    <fieldset className="diagnosis">
      <legend>¿Qué diagnóstico tienes?</legend>
      <p className="field-hint">Puedes marcar más de uno. Solo lo verá el equipo médico que revisa tu solicitud.</p>

      <div className="diag-grid">
        {CONDICIONES.map((c) => (
          <label key={c.name} className={`diag-card${value[c.name] ? " selected" : ""}`}>
            <input
              type="checkbox"
              name={c.name}
              checked={!!value[c.name]}
              onChange={() => toggle(c.name)}
            />
            <span className="diag-check" aria-hidden="true">
              <BsCheckCircle size={20} />
            </span>
            <span className="diag-label">{c.label}</span>
          </label>
        ))}
      </div>

      {error && (
        <span className="error-message" role="alert">
          {error}
        </span>
      )}
    </fieldset>
  );
};

export default DiagnosisCards;
