/* eslint-disable */
import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";

const Paso2 = (props) => {
  const { siguientePaso, handleFormChange, formData, pasoAnterior } = props;
  const { register, handleSubmit, errors, getValues } = useForm();

  const [email, setEmail] = useState(formData.correoElectronico);
  const [loading, setLoading] = useState(false);

  const irAlSiguientePaso = async (data) => {
    setLoading(true);

    const res = await axios.post(
      "https://ruidea.herokuapp.com/inscripcion/comprobar-mail",
      { mail: email }
    );
    if (res.data.disponible) {
      handleFormChange(data);
      siguientePaso();
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ya existe un usuario con ese correo electrónico.",
      });
    }

    setLoading(false);
  };

  const irAlPasoAnterior = (e) => {
    e.preventDefault();
    pasoAnterior(getValues());
  };

  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  return (
    <form className="formulario" onSubmit={handleSubmit(irAlSiguientePaso)}>
      <div className="row">
        <div className="wrapper-form">
          <label htmlFor="lugarNacimiento">Lugar de nacimiento</label>
          {errors.lugarNacimiento && (
            <span className="error-message">
              {errors.lugarNacimiento.message}
            </span>
          )}
          <input
            type="text"
            name="lugarNacimiento"
            id="lugarNacimiento"
            defaultValue={formData.lugarNacimiento}
            ref={register({ required: "Por favor, rellene este campo" })}
          />
        </div>

        <div className="wrapper-form">
          <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
          {errors.fechaNacimiento && (
            <span className="error-message">
              {errors.fechaNacimiento.message}
            </span>
          )}
          <input
            type="date"
            name="fechaNacimiento"
            id="fechaNacimiento"
            defaultValue={formData.fechaNacimiento}
            ref={register({ required: "Por favor, rellene este campo" })}
          />
        </div>
      </div>
      <div className="row">
        <div className="wrapper-form">
          <label htmlFor="numeroDocumento">Numero de documento</label>
          {errors.numeroDocumento && (
            <span className="error-message">
              {errors.numeroDocumento.message}
            </span>
          )}
          <input
            type="text"
            name="numeroDocumento"
            id="numeroDocumento"
            defaultValue={formData.numeroDocumento}
            ref={register({ required: "Por favor, rellene este campo" })}
          />
        </div>
        <div className="wrapper-form">
          <label htmlFor="numeroTelefono">Numero de teléfono móvil</label>
          {errors.numeroTelefono && (
            <span className="error-message">
              {errors.numeroTelefono.message}
            </span>
          )}
          <input
            type="text"
            name="numeroTelefono"
            id="numeroTelefono"
            defaultValue={formData.numeroTelefono}
            ref={register({
              required: "Por favor, rellene este campo",
              pattern: {
                value: /^[0-9+ ]+$/gm,
                message: "Por favor ingrese un número de teléfono válido",
              },
            })}
          />
        </div>
      </div>

      <div className="row">
        <div className="wrapper-form">
          <label htmlFor="correoElectronico">Correo electrónico</label>
          {errors.correoElectronico && (
            <span className="error-message">
              {errors.correoElectronico.message}
            </span>
          )}
          <input
            type="text"
            name="correoElectronico"
            id="correoElectronico"
            defaultValue={formData.correoElectronico}
            ref={register({
              required: "Por favor, rellene este campo",
              pattern: {
                value: emailRegex,
                message: "Por favor ingrese una dirección de correo válida",
              },
            })}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div className="wrapper-form">
          <label htmlFor="verificarCorreoElectronico">
            Verificar correo electrónico
          </label>
          {errors.verificarCorreoElectronico && (
            <span className="error-message">
              {errors.verificarCorreoElectronico.message}
            </span>
          )}

          <input
            type="text"
            name="verificarCorreoElectronico"
            id="verificarCorreoElectronico"
            defaultValue={formData.verificarCorreoElectronico}
            ref={register({
              required: "Por favor, rellene este campo",
              pattern: {
                value: emailRegex,
                message: "Por favor ingrese una dirección de correo válida",
              },
              validate: (value) =>
                value === email || "Los correos ingresados no coinciden.",
            })}
          />
        </div>
      </div>
      <div className="botones">
        <button role="button" type="submit" className="btn-siguiente">
          {loading ? "Cargando..." : "Siguiente"}
        </button>
        <button onClick={irAlPasoAnterior} className="btn-anterior">
          Anterior
        </button>
      </div>
    </form>
  );
};

export default Paso2;
