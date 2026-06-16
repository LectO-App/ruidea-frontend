import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { BsArrowRight } from "react-icons/bs";

import Field from "./form/Field";
import PasswordField from "./form/PasswordField";
import { checkMail } from "../util/registrationApi";
import { suggestEmail } from "../util/identity";

// Step 1 — create the account (REGISTRATION_UX.md §1). Just email + password, so the
// commitment is ~15 seconds and everything after it is saved and resumable. Email gets a
// typo suggestion and an availability check; the password field has a reveal toggle and a
// strength meter (§3) — no confirm field, no composition rules (WCAG 2.2 §3.3.8).
const PasoCuenta = (props) => {
  const { formData, onAccountCreated } = props;
  const { register, handleSubmit, errors, watch, setError } = useForm({ mode: "onBlur" });

  const [suggestion, setSuggestion] = useState(null);
  const [loading, setLoading] = useState(false);

  const emailRules = {
    required: "Necesitamos tu correo para crear la cuenta",
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Revisa el correo, parece incompleto" },
  };

  const onEmailBlur = (e) => setSuggestion(suggestEmail(e.target.value));

  const submit = async (data) => {
    setLoading(true);
    try {
      const { disponible, sugerencia } = await checkMail(data.correoElectronico);
      if (sugerencia) setSuggestion(sugerencia);
      if (!disponible) {
        setError("correoElectronico", {
          type: "manual",
          message: "Ya hay una cuenta con este correo. Inicia sesión para continuar.",
        });
        setLoading(false);
        return;
      }
      await onAccountCreated({ correoElectronico: data.correoElectronico, password: data.password });
    } catch (err) {
      const status = err && err.response && err.response.status;
      setError("correoElectronico", {
        type: "manual",
        message:
          status === 409
            ? "Ya hay una cuenta con este correo. Inicia sesión para continuar."
            : "No pudimos crear la cuenta. Vuelve a intentarlo.",
      });
      setLoading(false);
    }
  };

  return (
    <form className="step-form" onSubmit={handleSubmit(submit)} noValidate>
      <p className="step-intro">
        Crea tu cuenta para empezar. Podrás completar el resto cuando quieras: guardamos tu progreso
        automáticamente.
      </p>

      <Field
        name="correoElectronico"
        label="Tu correo electrónico"
        type="email"
        inputMode="email"
        autoComplete="email"
        defaultValue={formData.correoElectronico}
        rules={emailRules}
        register={register}
        errors={errors}
        watch={watch}
        onBlur={onEmailBlur}
      >
        {suggestion && (
          <button
            type="button"
            className="suggestion"
            onClick={() => {
              const el = document.getElementById("correoElectronico");
              if (el) el.value = suggestion;
              setSuggestion(null);
            }}
          >
            ¿Quisiste decir <strong>{suggestion}</strong>?
          </button>
        )}
      </Field>

      <PasswordField
        register={register}
        errors={errors}
        defaultValue={formData.password}
        hint="Mínimo 8 caracteres. Toca el ojo para verla mientras escribes."
      />

      <div className="step-actions">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Creando cuenta…" : "Continuar"} <BsArrowRight aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default PasoCuenta;
