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

const Dashboard = (props) => {
  const cookies = new Cookies();

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

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
              <button role="button">Descargar como PDF</button>
              <button role="button">Descargar como JPG</button>
              <button role="button">Obtener link de pasaporte</button>
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
          <div className="texto-revision">
            <h1>revision</h1>
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
              <div className="imagenes">
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
