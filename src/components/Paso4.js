import React from "react";

import { useForm } from "react-hook-form";

import upload from "../img/upload.svg";

const Paso4 = (props) => {
  const { siguientePaso, handleFormChange, formData, pasoAnterior } = props;
  const { register, handleSubmit, errors, getValues } = useForm();

  const irAlSiguientePaso = (data) => {
    handleFormChange(data);
    siguientePaso();
  };

  const irAlPasoAnterior = (e) => {
    e.preventDefault();
    pasoAnterior();
    pasoAnterior(getValues());
  };

  return (
    <form className="fileform" onSubmit={handleSubmit(irAlSiguientePaso)}>
      <div className="filePicker">
        <input
          type="file"
          name="linkDiagnostico"
          id="linkDiagnostico"
          ref={register({
            required: "Por favor adjunte su diagnóstico médico.",
          })}
        />
        <label htmlFor="linkDiagnostico">
          <img src={upload} alt="Icono Upload" />
          <span> Adjuntar diagnostico</span>
        </label>
        {errors.linkDiagnostico && (
          <span className="error-message">
            {errors.linkDiagnostico.message}
          </span>
        )}
      </div>

      <div className="filePicker">
        <input
          type="file"
          name="dniPasaporte"
          id="dniPasaporte"
          ref={register({ required: "Por favor adjunte su DNI o pasaporte." })}
        />
        <label htmlFor="dniPasaporte">
          <img src={upload} alt="Icono Subir Archivo"></img>{" "}
          <span> Adjuntar DNI o Pasaporte</span>
        </label>
        {errors.dniPasaporte && (
          <span className="error-message">{errors.dniPasaporte.message}</span>
        )}
      </div>
      <div className="btn-aceptar">
        <input
          type="checkbox"
          name="aceptoRecibirInfo"
          id="aceptoRecibirInfo"
          defaultChecked={formData.aceptoRecibirInfo || false}
          ref={register({ required: "Por favor acepte esta casilla." })}
        />
        <label htmlFor="aceptoRecibirInfo">
          Acepto recibir información actualizada sobre dislexia y otras DEAs.
        </label>
      </div>

      {errors.aceptoRecibirInfo && (
        <p className="error-message">{errors.aceptoRecibirInfo.message}</p>
      )}

      <div className="btn-aceptar">
        <input
          type="checkbox"
          name="aceptoSolicitud"
          id="aceptoSolicitud"
          defaultChecked={formData.aceptoSolicitud || false}
          ref={register({ required: "Por favor acepte esta casilla." })}
        />
        <label htmlFor="aceptoSolicitud">
          Acepto la solicitud del pasaporte DEA y la política de protección de
          datos.
        </label>
      </div>

      {errors.aceptoSolicitud && (
        <p className="error-message">{errors.aceptoSolicitud.message}</p>
      )}

      <div className="botones">
        <button type="submit" className="btn-siguiente">
          Finalizar
        </button>
        <button onClick={irAlPasoAnterior} className="btn-anterior">
          Anterior
        </button>
      </div>
    </form>
  );
};

export default Paso4;
