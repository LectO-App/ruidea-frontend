import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import auth from "../auth";

import Cookies from "universal-cookie";

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
    delete formData.verificarPassword;

    /* formData.correoElectronico = formData.correoElectronico.toLower(); */

    formData.linkPasaporte = "https://google.com";
    formData.linkDiagnostico = "https://google.com";

    const cookies = new Cookies();

    if (cookies.get("id")) {
      try {
        await axios.put(
          "https://ruidea.herokuapp.com/inscripcion/actualizar",
          formData
        );
        Swal.fire({
          icon: "success",
          title: "Perfecto!",
          text:
            "Sus datos han sido actualizados y serán revisados nuevamente. Gracias!",
          onAfterClose: () => {
            historyPush("/dashboard");
          },
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Lo sentimos",
          text: "Hubo un error al actualizar sus datos.",
        });
      }
    } else {
      try {
        const res = await axios.post(
          "https://ruidea.herokuapp.com/inscripcion",
          formData
        );
        console.log(res);
        Swal.fire({
          icon: "success",
          title: "Excelente!",
          text:
            "Su solicitud será analizada por especialistas dentro de los próximos días. Gracias!",
          showConfirmButton: true,
          confirmButtonText: "Aceptar",
          onAfterClose: () => {
            auth.login(() => {
              cookies.set("logged-in", true, { path: "/", expires: 0 });
              cookies.set("id", res.data._id, { path: "/", expires: 0 });
              historyPush("/dashboard");
            });
          },
        });
      } catch (err) {
        console.log(err);
        Swal.fire({
          icon: "error",
          title: "Lo sentimos",
          text: "Hubo un error al subir sus datos.",
        });
      }
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
        <li>
          <strong>
            <u>Diagnósticos: </u>
          </strong>
        </li>
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
