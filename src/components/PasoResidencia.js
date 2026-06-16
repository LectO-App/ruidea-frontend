import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BsArrowRight, BsArrowLeft } from "react-icons/bs";

import Field from "./form/Field";
import PhoneField from "./form/PhoneField";
import { documentoError, looksLikePhone } from "../util/identity";

// Fields on this step that the server can reject, so a backend validation error lands on
// the right input (the phone is handled separately via its own state).
const DOC_FIELDS = ["numeroDocumento", "paisResidencia", "localidadResidencia", "lugarNacimiento", "tipoDocumento"];

const PAISES = [
  "España", "Andorra", "Argentina", "Bolivia", "Brasil", "Chile", "Colombia",
  "Costa Rica", "Cuba", "Ecuador", "El Salvador", "Guatemala", "México",
  "Nicaragua", "Panamá", "Paraguay", "Perú", "Portugal", "República Dominicana",
  "Uruguay", "Venezuela",
];

// Step — where you live and your identity document. The document number is checked
// against its real checksum (DNI/NIE) as you go, so an error is caught here and not at
// review (§3). Phone formatting is forgiving; the server canonicalises it (§2).
const PasoResidencia = (props) => {
  const { formData, onNext, onBack, serverErrors } = props;
  const { register, handleSubmit, errors, watch, getValues, setError, clearErrors } = useForm({
    mode: "onBlur",
  });

  const [telefono, setTelefono] = useState(formData.numeroTelefono || "");
  const [phoneError, setPhoneError] = useState(null);

  // The user landed (or was sent back) here with errors the server flagged on submit —
  // show each one on its field so the fix is obvious.
  useEffect(() => {
    if (!serverErrors) return;
    serverErrors.forEach(({ path, message }) => {
      if (path === "numeroTelefono") setPhoneError(message);
      else if (DOC_FIELDS.includes(path)) setError(path, { type: "server", message });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverErrors]);


  const validateDoc = () => {
    const tipo = getValues("tipoDocumento") || formData.tipoDocumento;
    const num = getValues("numeroDocumento");
    const pais = getValues("paisResidencia") || formData.paisResidencia;
    if (!num) return true;
    const msg = documentoError(tipo, num, pais);
    if (msg) setError("numeroDocumento", { type: "manual", message: msg });
    else clearErrors("numeroDocumento");
    return !msg;
  };

  const submit = (data) => {
    let ok = true;
    const docMsg = documentoError(data.tipoDocumento, data.numeroDocumento, data.paisResidencia);
    if (docMsg) {
      setError("numeroDocumento", { type: "manual", message: docMsg });
      ok = false;
    }
    if (!looksLikePhone(telefono)) {
      setPhoneError("Revisa el número de teléfono");
      ok = false;
    } else {
      setPhoneError(null);
    }
    if (ok) onNext({ ...data, numeroTelefono: telefono });
  };

  const back = () => onBack({ ...getValues(), numeroTelefono: telefono });

  // Only show the Spanish check-letter example when the country is Spain.

  return (
    <form className="step-form" onSubmit={handleSubmit(submit)} noValidate>
      <div className="field-row">
        <div className="field">
          <label htmlFor="paisResidencia">País de residencia</label>
          <select
            name="paisResidencia"
            id="paisResidencia"
            autoComplete="country-name"
            defaultValue={formData.paisResidencia || "España"}
            ref={register({ required: "Elige un país" })}
          >
            {PAISES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {errors.paisResidencia && (
            <span className="error-message" role="alert">
              {errors.paisResidencia.message}
            </span>
          )}
        </div>

        <Field
          name="localidadResidencia"
          label="Localidad"
          autoComplete="address-level2"
          defaultValue={formData.localidadResidencia}
          rules={{ required: "Falta tu localidad" }}
          register={register}
          errors={errors}
          watch={watch}
        />
      </div>

      <Field
        name="lugarNacimiento"
        label="Lugar de nacimiento"
        defaultValue={formData.lugarNacimiento}
        rules={{ required: "Falta el lugar de nacimiento" }}
        register={register}
        errors={errors}
        watch={watch}
      />

      <div className="field-row">
        <div className="field">
          <label htmlFor="tipoDocumento">Tipo de documento</label>
          <select
            name="tipoDocumento"
            id="tipoDocumento"
            defaultValue={formData.tipoDocumento || ""}
            ref={register({ required: "Elige el tipo de documento" })}
            onChange={validateDoc}
          >
            <option value="" disabled>
              Elige una opción
            </option>
            <option value="dni">DNI</option>
            <option value="nie">NIE</option>
            <option value="pasaporte">Pasaporte</option>
          </select>
          {errors.tipoDocumento && (
            <span className="error-message" role="alert">
              {errors.tipoDocumento.message}
            </span>
          )}
        </div>

        <Field
          name="numeroDocumento"
          label="Número de documento"
          defaultValue={formData.numeroDocumento}
          rules={{ required: "Escribe tu número de documento" }}
          register={register}
          errors={errors}
          watch={watch}
          onBlur={validateDoc}
        />
      </div>

      <PhoneField
        label="Teléfono móvil"
        hint="Elige tu país y escribe el número, sin el prefijo."
        defaultValue={formData.numeroTelefono}
        value={telefono}
        onChange={(v) => {
          setTelefono(v);
          if (phoneError) setPhoneError(null);
        }}
        error={phoneError}
      />

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={back}>
          <BsArrowLeft aria-hidden="true" /> Atrás
        </button>
        <button type="submit" className="btn-primary">
          Continuar <BsArrowRight aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default PasoResidencia;
