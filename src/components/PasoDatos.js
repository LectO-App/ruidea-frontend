import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { BsArrowRight, BsArrowLeft } from "react-icons/bs";

import Field from "./form/Field";
import DateOfBirth from "./form/DateOfBirth";
import { partsToISODate } from "../util/identity";

const TEXT_FIELDS = ["nombre", "apellidos", "tutorNombre", "tutorApellidos", "tutorParentesco"];

// Step — who the passport is for, plus the applicant's name and date of birth.
// The guardian branch (§0) lets a parent apply for a child without fighting field labels.
const PasoDatos = (props) => {
  const { formData, onNext, onBack, isFirst, serverErrors } = props;
  const { register, handleSubmit, errors, watch, getValues, setError, clearErrors } = useForm({
    mode: "onBlur",
  });

  const [esTutor, setEsTutor] = useState(!!formData.esTutor);

  // Surface any errors the server flagged on submit (the date of birth maps to the "dia"
  // field, which is where DateOfBirth renders its message).
  useEffect(() => {
    if (!serverErrors) return;
    serverErrors.forEach(({ path, message }) => {
      if (path === "fechaNacimiento") setError("dia", { type: "manual", message });
      else if (TEXT_FIELDS.includes(path)) setError(path, { type: "server", message });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverErrors]);

  const build = (data) => {
    const fechaNacimiento = partsToISODate(data.dia, data.mes, data.anio);
    if (!fechaNacimiento) {
      setError("dia", { type: "manual", message: "Revisa la fecha de nacimiento" });
      return null;
    }
    clearErrors("dia");
    return {
      nombre: data.nombre,
      apellidos: data.apellidos,
      fechaNacimiento,
      esTutor,
      tutorNombre: esTutor ? data.tutorNombre : "",
      tutorApellidos: esTutor ? data.tutorApellidos : "",
      tutorParentesco: esTutor ? data.tutorParentesco : "",
    };
  };

  const submit = (data) => {
    const patch = build(data);
    if (patch) onNext(patch);
  };

  const back = () => {
    const patch = build(getValues()) || {};
    onBack(patch);
  };

  return (
    <form className="step-form" onSubmit={handleSubmit(submit)} noValidate>
      <fieldset className="choice">
        <legend>¿Para quién es el pasaporte?</legend>
        <div className="choice-options">
          <label className={`choice-card${!esTutor ? " selected" : ""}`}>
            <input type="radio" name="paraQuien" checked={!esTutor} onChange={() => setEsTutor(false)} />
            <span>Para mí</span>
          </label>
          <label className={`choice-card${esTutor ? " selected" : ""}`}>
            <input type="radio" name="paraQuien" checked={esTutor} onChange={() => setEsTutor(true)} />
            <span>Para alguien que cuido</span>
          </label>
        </div>
      </fieldset>

      {esTutor && (
        <div className="subsection">
          <p className="step-intro">Tus datos como tutor/a o representante:</p>
          <div className="field-row">
            <Field
              name="tutorNombre"
              label="Tu nombre"
              autoComplete="given-name"
              defaultValue={formData.tutorNombre}
              rules={{ required: "Falta tu nombre" }}
              register={register}
              errors={errors}
              watch={watch}
            />
            <Field
              name="tutorApellidos"
              label="Tus apellidos"
              autoComplete="family-name"
              defaultValue={formData.tutorApellidos}
              rules={{ required: "Faltan tus apellidos" }}
              register={register}
              errors={errors}
              watch={watch}
            />
          </div>
          <Field
            name="tutorParentesco"
            label="¿Qué relación tienes con la persona?"
            defaultValue={formData.tutorParentesco}
            rules={{ required: "Indica la relación" }}
            register={register}
            errors={errors}
            watch={watch}
          />
          <hr className="divider" />
        </div>
      )}

      <p className="step-intro">{esTutor ? "Datos de la persona que cuidas:" : "Tus datos:"}</p>
      <div className="field-row">
        <Field
          name="nombre"
          label="Nombre"
          autoComplete={esTutor ? "off" : "given-name"}
          defaultValue={formData.nombre}
          rules={{ required: "Por favor, escribe el nombre" }}
          register={register}
          errors={errors}
          watch={watch}
        />
        <Field
          name="apellidos"
          label="Apellidos"
          autoComplete={esTutor ? "off" : "family-name"}
          defaultValue={formData.apellidos}
          rules={{ required: "Por favor, escribe los apellidos" }}
          register={register}
          errors={errors}
          watch={watch}
        />
      </div>

      <DateOfBirth register={register} errors={errors} defaultISO={formData.fechaNacimiento} error={errors.dia && errors.dia.type === "manual" ? errors.dia.message : null} />

      <div className="step-actions">
        {!isFirst && (
          <button type="button" className="btn-secondary" onClick={back}>
            <BsArrowLeft aria-hidden="true" /> Atrás
          </button>
        )}
        <button type="submit" className="btn-primary">
          Continuar <BsArrowRight aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default PasoDatos;
