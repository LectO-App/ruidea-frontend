/* eslint-disable */
import React, { useState, useEffect } from "react";
import { axiosInstance } from "../axios";
import Cookies from "universal-cookie";
import { Helmet } from "react-helmet";
import { motion } from "framer-motion";

import logoLecto from "../img/logo-lecto.webp";
import logoDisfam from "../img/logo-disfam.webp";

import successIcon from "../img/success-icon.svg";
import pendingIcon from "../img/pending-icon.svg";
import failureIcon from "../img/failure-icon.svg";

import LoadingScreen from "./LoadingScreen";

import Navbar from "./Navbar";

import { Link } from "react-router-dom";

const Dashboard = (props) => {
  const cookies = new Cookies();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchFromAPI = async (id) => {
    const res = await axiosInstance.get(`/usuario/estado/${id}`);
    setData(res.data);

    setLoading(false);
  };
  const idUsuario = cookies.get("id");

  useEffect(() => {
    fetchFromAPI(idUsuario);
  }, []);

  const getFileFromServer = async (type) => {
    setLoading(true);
    const isPdf = type === "pdf";
    const res = await axiosInstance.get(
      `/usuario/descargar/${type}/${data._id}`,
      {
        responseType: "arraybuffer",
        headers: {
          Accept: isPdf ? "application/pdf" : "image/jpeg",
        },
      }
    );
    const blob = new Blob([res.data], {
      type: isPdf ? "application/pdf" : "image/jpeg",
    });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = isPdf
      ? `Certificado Ruidea.pdf`
      : "Certificado Ruidea.jpeg";
    link.click();
    setLoading(false);
  };

  const switchData = () => {
    switch (data.estado) {
      case "aceptado":
        return (
          <div className="texto-aprobado">
            <div className="estado-solicitud">
              <img src={successIcon} alt="Ícono Aprobada" />
              <span className="txt-aprobada">Aprobada!</span>
            </div>
            <div className="botones-descargar">
              <button
                role="button"
                onClick={(e) => {
                  getFileFromServer("pdf");
                }}
              >
                Descargar como PDF
              </button>
              <button
                role="button"
                onClick={() => {
                  getFileFromServer("img");
                }}
              >
                Descargar como JPG
              </button>
              <Link
                to={`/verificar/${data.numeroDocumento}/${data.numeroPasaporte}`}
                role="button"
              >
                Obtener link de pasaporte
              </Link>
            </div>
          </div>
        );
      case "pendiente":
        return (
          <div className="texto-pendiente">
            <div className="estado-solicitud">
              <img src={pendingIcon} alt="Ícono Pendiente" />
              <span className="txt-pendiente">Pendiente...</span>
            </div>
          </div>
        );
      case "revision":
        return (
          <div className="texto-pendiente">
            <div className="estado-solicitud">
              <img src={pendingIcon} alt="Ícono Pendiente" />
              <span className="txt-pendiente">Revisión</span>
            </div>
            <p className="mensaje-especialista-label">
              Mensaje del especialista:
            </p>
            <p className="mensaje-especialista">{data.mensajeMedico}</p>
            <div className="botones-descargar">
              <Link to="/inscribirse" role="button">
                Editar inscripcion
              </Link>
            </div>
          </div>
        );
      case "rechazado":
        return (
          <div className="texto-rechazado">
            <div className="estado-solicitud">
              <img src={failureIcon} alt="Ícono Rechazada" />
              <span className="txt-rechazado">Rechazada</span>
            </div>
          </div>
        );
    }
  };

  return (
    <motion.div
      exit={{ transform: "translateX(100vw)" }}
      animate={{ transform: "translateX(0vw)" }}
      initial={{ transform: "translateX(100vw)" }}
      className="dashboard-div-main"
    >
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          Dashboard | RUIDEA - Registro Único Iberoamericano de Personas con
          Dificultades Específicas del Aprendizaje
        </title>
      </Helmet>
      {loading && <LoadingScreen />}
      <>
        <Navbar />
        <main className="dashboard-main">
          <h1>Hola, {data.nombre}!</h1>
          {data.emailVerificado ? (
            <div className="card-estado">
              <h5>Estado de tu solicitud</h5>
              {switchData()}
            </div>
          ) : (
            <div className="container-verificar-mail">
              <h2 className="titulo-verificar-mail">
                Correo electrónico no verificado
              </h2>
              <h3 className="texto-verificar-mail">
                Por favor, entre al enlace que enviamos a su correo electrónico
                para verificar su identidad. Si no lo encuentra, revise la
                casilla de spam.
              </h3>
              <button
                className="btn-no-recibi-mail"
                onClick={() => {
                  const resendEmail = async () => {
                    await axiosInstance.post(
                      `/emailVerification/resend/${idUsuario}`
                    );
                  };
                  resendEmail();
                }}
              >
                No recibí ningún mail
              </button>
            </div>
          )}
          <div className="creado-por-lecto">
            <p>Sistema creado por el equipo de LectO.</p>
            <div className="imagenes" id="card-estado">
              <img src={logoLecto} alt="Logo LectO" className="imagen-lecto" />
              <img
                src={logoDisfam}
                alt="Logo Disfam"
                className="imagen-disfam"
              />
            </div>
          </div>
        </main>
      </>
    </motion.div>
  );
};

export default Dashboard;
