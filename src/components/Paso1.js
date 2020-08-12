import React from "react";
import { useForm } from "react-hook-form";

const Paso1 = (props) => {
  const { siguientePaso, handleFormChange, formData } = props;
  const { register, handleSubmit, errors } = useForm();

  const irAlSiguientePaso = (data) => {
    handleFormChange(data);
    siguientePaso();
  };

  return (
    <form className="formulario" onSubmit={handleSubmit(irAlSiguientePaso)}>
      <div className="row">
        <div className="wrapper-form">
          <label htmlFor="nombre">Nombre</label>
          {errors.nombre && (
            <span className="error-message">{errors.nombre.message}</span>
          )}
          <input
            autoFocus
            type="text"
            name="nombre"
            id="nombre"
            defaultValue={formData.nombre}
            ref={register({
              required: "Por favor, rellene este campo",
              pattern: {
                value: /[a-zA-Z]/,
                message: "Sólo se admiten letras y espacios.",
              },
            })}
          />
        </div>
        <div className="wrapper-form">
          <label htmlFor="apellidos">Apellidos</label>
          {errors.apellidos && (
            <span className="error-message">{errors.apellidos.message}</span>
          )}
          <input
            type="text"
            name="apellidos"
            id="apellidos"
            defaultValue={formData.apellidos}
            ref={register({
              required: "Por favor, rellene este campo",
              pattern: {
                value: /[a-zA-Z]/,
                message: "Sólo se admiten letras y espacios.",
              },
            })}
          />
        </div>
      </div>
      <div className="row">
        <div className="wrapper-form">
          <label htmlFor="paisResidencia">País de residencia</label>
          {errors.paisResidencia && (
            <span className="error-message">
              {errors.paisResidencia.message}
            </span>
          )}
          <select
            name="paisResidencia"
            id="paisResidencia"
            ref={register({ required: "Por favor, rellene este campo" })}
            defaultValue={formData.paisResidencia}
          >
            <option value="" disabled>
              Seleccione un país
            </option>
            <option value="Argentina">Argentina</option>
            <option value="España">España</option>
            <option value="Argentina">Argentina</option>
            <option value="Argentina">Argentina</option>
            <option value="Argentina">Argentina</option>
            <option value="Argentina">Argentina</option>
            <option value="Argentina">Argentina</option>
          </select>
        </div>
        <div className="wrapper-form">
          <label htmlFor="localidadResidencia">Localidad</label>
          {errors.localidadResidencia && (
            <span className="error-message">
              {errors.localidadResidencia.message}
            </span>
          )}
          <input
            type="text"
            name="localidadResidencia"
            id="localidadResidencia"
            defaultValue={formData.localidadResidencia}
            ref={register({ required: "Por favor, rellene este campo" })}
          />
        </div>
      </div>
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
            placeholder="Ciudad y País"
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
            defaultValue={
              formData.fechaNacimiento
                ? formData.fechaNacimiento.substring(0, 10)
                : ""
            }
            ref={register({ required: "Por favor, rellene este campo" })}
          />
        </div>
      </div>
      <div className="botones">
        <button type="submit" className="btn-siguiente">
          Siguiente
        </button>
      </div>
    </form>
  );
};

export default Paso1;
