/* eslint-disable */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { Helmet } from "react-helmet";

import logoLecto from "../img/logo-lecto.webp";
import logoDisfam from "../img/logo-disfam.webp";

import successIcon from "../img/success-icon.svg";
import pendingIcon from "../img/pending-icon.svg";
import failureIcon from "../img/failure-icon.svg";

import LoadingScreen from "./LoadingScreen";

import auth from "../auth";
import Navbar from "./Navbar";

import { Link } from "react-router-dom";

const Dashboard = (props) => {
  const cookies = new Cookies();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [img, setImg] = useState("");

  const fetchFromAPI = async (id) => {
    const res = await axios.get(
      `https://ruidea.herokuapp.com/usuario/estado/${id}`
    );
    setData(res.data);
    setLoading(false);
  };
  const idUsuario = cookies.get("id");

  useEffect(() => {
    fetchFromAPI(idUsuario);
  }, []);

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
              <a
                role="button"
                href={`https://api.urlbox.io/v1/fFZr9pUSCl4t4J0h/pdf?url=ruidea-template.netlify.app%2F%3Fnombre%3D${data.nombre}%26apellido%3D${data.apellidos}%26numeroDocumento%3D${data.numeroDocumento}%26numeroPasaporte%3D${data.numeroPasaporte}%26pais%3D${data.paisResidencia}&download=Pasaporte%20Ruidea.pdf`}
              >
                Descargar como PDF
              </a>
              <a
                role="button"
                href={`https://api.urlbox.io/v1/fFZr9pUSCl4t4J0h/png?url=ruidea-template.netlify.app%2F%3Fnombre%3D${data.nombre}%26apellido%3D${data.apellidos}%26numeroDocumento%3D${data.numeroDocumento}%26numeroPasaporte%3D${data.numeroPasaporte}%26pais%3D${data.paisResidencia}&download=Pasaporte%20Ruidea.png&width=480&height=960`}
              >
                Descargar como PNG
              </a>
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
            <p>Mensaje del especialista:</p>
            <p className="mensaje-especialista">{data.mensaje}</p>
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
            <p>Mensaje del especialista:</p>
            <p className="mensaje-especialista">{data.mensaje}</p>
          </div>
        );
    }
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>
          Dashboard | RUIDEA - Registro Único Iberoamericano de Personas con
          Dificultades Específicas del Aprendizaje
        </title>
      </Helmet>
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <Navbar />
          <main className="dashboard-main">
            <h2>Hola, {data.nombre}!</h2>
            <div className="card-estado">
              <h5>Estado de tu solicitud</h5>
              {switchData()}
            </div>
            <div className="creado-por-lecto">
              <p>Sistema creado por el equipo de LectO.</p>
              <div className="imagenes" id="card-estado">
                <img
                  src={logoLecto}
                  alt="Logo LectO"
                  className="imagen-lecto"
                />
                <img
                  src={logoDisfam}
                  alt="Logo Disfam"
                  className="imagen-disfam"
                />
              </div>
            </div>
          </main>
        </>
      )}
    </>
  );
};

export default Dashboard;
