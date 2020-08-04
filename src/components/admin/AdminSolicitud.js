import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

const AdminSolicitud = (props) => {
  const [user, setUser] = useState({});
  const [mensajeMedico, setMensajeMedico] = useState("");

  const postResultToAPI = async (estado) => {
    try {
      await axios.post("https://ruidea.herokuapp.com/admin/respuesta", {
        estado,
        mensajeMedico,
        emailUsuario: user.correoElectronico,
      });
      console.log({
        estado,
        mensajeMedico,
        emailUsuario: user.correoElectronico,
      });
      Swal.fire({
        icon: "success",
        title: "Enviado!",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Lo sentimos!",
        text: "Hubo un error al mandar la respuesta.",
      });
    }
  };

  const getUserFromAPI = async () => {
    try {
      const res = await axios.post(
        `https://ruidea.herokuapp.com/admin/solicitudes/${props.match.params.id}`
      );
      setUser(res.data.usuario);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUserFromAPI();
  }, []);

  return (
    <>
      {Object.keys(user).length === 0 ? (
        <h1 className="texto-cargando">Cargando...</h1>
      ) : (
        <main className="main-solicitud">
          <Link className="cross" to="/admin/solicitudes" role="button"></Link>
          <div className="container-solicitud">
            <h2>Verificar solicitud</h2>
            <p className="campo-informacion">
              Nombre completo:{" "}
              <span className="txt-info-usuario">
                {user.nombre} {user.apellidos}
              </span>
            </p>
            <p className="campo-informacion">
              DNI o Documento:{" "}
              <span className="txt-info-usuario">{user.numeroDocumento}</span>
            </p>
            <p className="campo-informacion">
              Pais de residencia:{" "}
              <span className="txt-info-usuario">{user.paisResidencia}</span>
            </p>
            <p className="campo-informacion">
              Localidad:{" "}
              <span className="txt-info-usuario">
                {user.localidadResidencia}
              </span>
            </p>
            <p className="campo-informacion">
              Fecha de nacimiento:{" "}
              <span className="txt-info-usuario">
                {user.fechaNacimiento.substring(0, 10)}
              </span>
            </p>
            <p className="campo-informacion">
              Correo electrónico:{" "}
              <span className="txt-info-usuario">{user.correoElectronico}</span>
            </p>
            <p className="campo-informacion">
              Número de teléfono:{" "}
              <span className="txt-info-usuario">{user.numeroTelefono}</span>
            </p>
            <p className="campo-informacion">
              Diagnóstico:{" "}
              <span className="txt-info-usuario">
                {Object.keys(user.diagnostico)
                  .filter((k) => user.diagnostico[k])
                  .map((item, i) => (
                    <span className="tipo-diagnostico">{`${
                      item === "tdah" ? "TDA-H" : item
                    }${
                      i !==
                      Object.keys(user.diagnostico).filter(
                        (k) => user.diagnostico[k]
                      ).length -
                        1
                        ? ", "
                        : "."
                    }`}</span>
                  ))}
              </span>
            </p>
            <p className="campo-informacion">
              Link Diagnóstico:{" "}
              <span className="txt-info-usuario">
                <a
                  href={user.linkDiagnostico}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver
                </a>
              </span>
            </p>
            <p className="campo-informacion">
              Link DNI o Pasaporte:{" "}
              <span className="txt-info-usuario">
                <a
                  href={user.linkPasaporte}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver
                </a>
              </span>
            </p>
          </div>
          <form>
            <div className="form-group-admin">
              <label htmlFor="mensajeMedico">
                Enviar mensaje (solo se enviará si se pide revisión):
              </label>
              <textarea
                name="mensajeMedico"
                id="mensajeMedico"
                onChange={(e) => {
                  setMensajeMedico(e.target.value);
                }}
              ></textarea>
            </div>
            <div className="botones-solicitud">
              <button
                className="btn-aceptar-solicitud"
                name="aceptado"
                onClick={(e) => {
                  e.preventDefault();
                  postResultToAPI("aceptado");
                }}
              >
                Aceptar solicitud
              </button>
              <button
                className="btn-revision-solicitud"
                name="revision"
                onClick={(e) => {
                  e.preventDefault();
                  postResultToAPI("revision");
                }}
              >
                Pedir revisión de solicitud
              </button>
              <button
                className="btn-rechazar-solicitud"
                name="rechazado"
                onClick={(e) => {
                  e.preventDefault();
                  postResultToAPI("rechazado");
                }}
              >
                Rechazar solicitud
              </button>
            </div>
          </form>
        </main>
      )}
    </>
  );
};

export default AdminSolicitud;
