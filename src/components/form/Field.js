import React from "react";
import { BsCheckCircle } from "react-icons/bs";

// One labelled text input with: a hint, an inline error tied via aria-describedby, and a
// calm green check once the field is valid (positive validation — REGISTRATION_UX.md §4).
// Bound to react-hook-form via the ref; `watch` drives the valid state without making the
// input controlled.
const Field = ({
  name,
  label,
  type = "text",
  rules,
  register,
  errors,
  watch,
  defaultValue = "",
  hint,
  autoComplete,
  inputMode,
  onBlur,
  children,
}) => {
  const value = watch ? watch(name) : undefined;
  const err = errors && errors[name];
  const valid = value && !err;
  const hintId = `${name}-hint`;
  const errId = `${name}-error`;

  return (
    <div className={`field${err ? " has-error" : ""}${valid ? " is-valid" : ""}`}>
      <label htmlFor={name}>{label}</label>
      {hint && (
        <p className="field-hint" id={hintId}>
          {hint}
        </p>
      )}
      <div className="input-wrap">
        <input
          type={type}
          name={name}
          id={name}
          defaultValue={defaultValue}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={err ? "true" : "false"}
          aria-describedby={`${hint ? hintId + " " : ""}${err ? errId : ""}`.trim() || undefined}
          ref={register(rules)}
          onBlur={onBlur}
        />
        {valid && <BsCheckCircle className="valid-check" aria-hidden="true" />}
      </div>
      {err && (
        <span className="error-message" id={errId} role="alert">
          {err.message}
        </span>
      )}
      {children}
    </div>
  );
};

export default Field;
