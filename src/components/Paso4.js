import React from "react";

import { useForm } from "react-hook-form";

import upload from "../img/upload.svg";

const Paso4 = (props) => {
  const { siguientePaso, handleFormChange, formData, pasoAnterior } = props;
  const { register, handleSubmit, errors } = useForm();

  const irAlSiguientePaso = (data) => {
    handleFormChange(data);
    siguientePaso();
  };

  const irAlPasoAnterior = (e) => {
    e.preventDefault();
    pasoAnterior();
  };

  return (
    <form className="fileform" onSubmit={handleSubmit(irAlSiguientePaso)}>
      <div className="filePicker">
        <input
          type="file"
          name="diagnostico"
          id="diagnostico"
          ref={register({
            required: "Por favor adjunte su diagnóstico médico.",
          })}
        />
        <label htmlFor="diagnostico">
          <img src={upload} alt="Icono Upload" />
          <span> Adjuntar diagnostico</span>
        </label>
        {errors.diagnostico && (
          <span className="error-message">{errors.diagnostico.message}</span>
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
          <img src={upload} alt=""></img> <span> Adjuntar DNI o Pasaporte</span>
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
        {errors.aceptoRecibirInfo && (
          <p className="error-message">{errors.aceptoRecibirInfo.message}</p>
        )}
      </div>

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

        {errors.aceptoSolicitud && (
          <p className="error-message">{errors.aceptoSolicitud.message}</p>
        )}
      </div>
      <div className="botones">
        <button onClick={irAlPasoAnterior}>Anterior</button>
        <button type="submit">Enviar</button>
      </div>
    </form>
  );
};

export default Paso4;
