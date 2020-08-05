import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import auth from "../auth";

const Paso5 = (props) => {
  const { formData, pasoAnterior, historyPush } = props;
  const {
    nombre,
    apellidos,
    paisResidencia,
    localidadResidencia,
    lugarNacimiento,
    fechaNacimiento,
    numeroDocumento,
    numeroTelefono,
    correoElectronico,
    diagnostico,
  } = formData;

  const irAlPasoAnterior = (e) => {
    e.preventDefault();
    pasoAnterior();
  };

  const [loading, setLoading] = useState(false);

  const postToAPI = async () => {
    setLoading(true);

    delete formData.dniPasaporte;
    delete formData.aceptoRecibirInfo;
    delete formData.aceptoSolicitud;
    delete formData.verificarCorreoElectronico;

    formData.linkPasaporte = "https://google.com";
    formData.linkDiagnostico = "https://google.com";
    try {
      await axios.post("https://ruidea.herokuapp.com/inscripcion", formData);

      Swal.fire({
        icon: "success",
        title: "Excelente!",
        text:
          "Su solicitud será analizada por especialistas dentro de los próximos días. Gracias!",
        showConfirmButton: true,
        confirmButtonText: "Aceptar",
        onAfterClose: () => {
          auth.login(() => {
            historyPush("/login");
          });
        },
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Lo sentimos!",
        text: "Hubo un error al enviar los datos de la inscripción.",
      });
    }
    setLoading(false);
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
          <strong>Localidad: </strong> {localidadResidencia}
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
          <strong>Teléfono: </strong> {numeroTelefono}
        </li>
        <li>
          <strong>Correo electrónico: </strong> {correoElectronico}
        </li>
        <br />
        <strong>Diagnósticos: </strong>
        <ul>
          {Object.entries(diagnostico).map((item) => {
            const string = item[0].charAt(0).toUpperCase() + item[0].slice(1);
            return item[1] && <li key={item[0]}>{string}</li>;
          })}
        </ul>
      </ul>
      <div className="botones">
        <button onClick={postToAPI} className="btn-siguiente">
          {loading ? "Enviando..." : "Enviar"}
        </button>
        <button onClick={irAlPasoAnterior} className="btn-anterior">
          Anterior
        </button>
      </div>
    </div>
  );
};

export default Paso5;
