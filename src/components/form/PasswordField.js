import React, { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { passwordStrength } from "../../util/identity";

// Password input with a reveal toggle and a strength meter, and NO composition rules
// beyond a minimum length — so password managers and pasting work, and we don't impose
// a cognitive memory test (REGISTRATION_UX.md §3, WCAG 2.2 §3.3.8). Registers with
// react-hook-form via the ref while tracking value locally to drive the meter.
const PasswordField = ({
  register,
  name = "password",
  label = "Contraseña",
  defaultValue = "",
  errors,
  autoComplete = "new-password",
  required = true,
  hint,
}) => {
  const [value, setValue] = useState(defaultValue || "");
  const [reveal, setReveal] = useState(false);
  const strength = passwordStrength(value);
  const error = errors && errors[name];

  const rules = {
    minLength: { value: 8, message: "Usa al menos 8 caracteres" },
  };
  if (required) rules.required = "Por favor, crea una contraseña";

  const hintId = `${name}-hint`;
  const errId = `${name}-error`;

  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      {hint && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      <div className="password-wrapper">
        <input
          type={reveal ? "text" : "password"}
          name={name}
          id={name}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={`${hint ? hintId + " " : ""}${error ? errId : ""}`.trim() || undefined}
          ref={register(rules)}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          className="reveal-btn"
          aria-label={reveal ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={reveal}
          onClick={() => setReveal((r) => !r)}
        >
          {reveal ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
        </button>
      </div>

      {value && (
        <div className="strength" aria-hidden="true">
          <div className="strength-bars">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={i <= strength.score ? `on s${strength.score}` : ""} />
            ))}
          </div>
          <span className="strength-label">{strength.label}</span>
        </div>
      )}

      {error && (
        <span className="error-message" id={errId} role="alert">
          {error.message}
        </span>
      )}
    </div>
  );
};

export default PasswordField;
