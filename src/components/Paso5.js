import React from "react";

import axios from "axios";

const Paso5 = (props) => {
  const { formData, pasoAnterior } = props;
  const {
    nombre,
    apellidos,
    paisResidencia,
    localidad,
    lugarNacimiento,
    fechaNacimiento,
    numeroDocumento,
    telefono,
    correoElectronico,
    diagnosticos,
  } = formData;

  const irAlPasoAnterior = (e) => {
    e.preventDefault();
    pasoAnterior();
  };

  const postToAPI = async () => {
    const res = await axios.post(
      "https://ruidea.herokuapp.com/inscripcion",
      formData
    );
    console.log(res);
  };

  return (
    <div className="resultados">
      <h2>
        Por favor, verifique que haya ingresado sus datos correctamente antes de
        enviar el formulario
      </h2>
      <ul>
        <li>
          <strong>Nombre: </strong> {nombre}
        </li>
        <li>
          <strong>Apellidos: </strong> {apellidos}
        </li>
        <li>
          <strong>País de residencia: </strong> {paisResidencia}
        </li>
        <li>
          <strong>Localidad: </strong> {localidad}
        </li>
        <li>
          <strong>Lugar de nacimiento: </strong> {lugarNacimiento}
        </li>
        <li>
          <strong>Fecha de nacimiento: </strong> {fechaNacimiento}
        </li>
        <li>
          <strong>Numero de documento: </strong> {numeroDocumento}
        </li>
        <li>
          <strong>Teléfono: </strong> {telefono}
        </li>
        <li>
          <strong>Correo electrónico: </strong> {correoElectronico}
        </li>
        <br />
        <strong>Diagnósticos: </strong>
        <ul>
          {Object.entries(diagnosticos).map((item) => {
            const string = item[0].charAt(0).toUpperCase() + item[0].slice(1);
            return item[1] && <li key={item[0]}>{string}</li>;
          })}
        </ul>
      </ul>
      <div className="botones">
        <button onClick={postToAPI} className="btn-siguiente">
          Finalizar
        </button>
        <button onClick={irAlPasoAnterior} className="btn-anterior">
          Anterior
        </button>
      </div>
    </div>
  );
};

export default Paso5;
