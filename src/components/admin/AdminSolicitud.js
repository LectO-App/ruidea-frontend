import React, { useState, useEffect } from "react";
import { axiosInstance } from "../../axios";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";

import iconSuccess from "../../img/svg/success-icon.svg";
import iconSuccessPNG from "../../img/png/success-icon.png";
import iconFail from "../../img/svg/failure-icon.svg";
import iconFailPNG from "../../img/png/failure-icon.png";

import LoadingScreen from "../LoadingScreen";

const AdminSolicitud = (props) => {
  const [user, setUser] = useState({});

  const postResultToAPI = async (
    estado,
    mensajeMedico = "",
    mostrarPopup = true
  ) => {
    try {
      await axiosInstance.post(`/admin/respuesta`, {
        estado,
        mensajeMedico,
        emailUsuario: user.correoElectronico,
      });
      mostrarPopup &&
        Swal.fire({
          icon: "success",
          title: "Enviado!",
        }).then(() => {
          props.history.push("/admin/solicitudes");
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
      const res = await axiosInstance.post(
        `/admin/solicitudes/${props.match.params.id}`
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
        <LoadingScreen />
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
              Link a Diagnóstico y DNI o Pasaporte:{" "}
              <span className="txt-info-usuario">
                <button
                  className="btn-descargar-archivos"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    const fetchLink = async (btn) => {
                      const res = await axiosInstance.get(
                        `/inscripcion/link-archivos/${user._id}`
                      );
                      const link = document.createElement("a");
                      link.href = res.data;
                      link.click();
                    };
                    fetchLink(e);
                  }}
                >
                  Descargar
                </button>
              </span>
            </p>
          </div>
          {user.estado === "pendiente" && (
            <form>
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
                    const showDialog = async () => {
                      await Swal.fire({
                        input: "textarea",
                        inputPlaceholder: "Enviar un mensaje al usuario",
                        inputAttributes: {
                          "aria-label": "Enviar un mensaje al usuario",
                          style: "resize:none;",
                          onChange: "",
                        },
                        showCancelButton: true,
                      }).then((result) => {
                        console.log(result.value);
                        postResultToAPI(
                          "revision",
                          result.value,
                          !result.value ? true : false
                        );
                      });
                    };
                    showDialog();
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
          )}
          {user.estado === "aceptado" && (
            <div className="estado-solicitud">
              <picture>
                <source srcSet={iconSuccess} />
                <img src={iconSuccessPNG} alt="Ícono Solicitud Aprobada" />
              </picture>
              <span className="txt-aprobada">Aprobada!</span>
            </div>
          )}

          {user.estado === "rechazado" && (
            <div className="estado-solicitud">
              <picture>
                <source srcSet={iconFail} />
                <img src={iconFailPNG} alt="Ícono Solicitud Rechazada" />
              </picture>
              <span className="txt-rechazado">Rechazada</span>
            </div>
          )}
        </main>
      )}
    </>
  );
};

export default AdminSolicitud;
