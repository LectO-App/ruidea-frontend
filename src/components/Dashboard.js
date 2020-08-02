/* eslint-disable */
import React, { useState, useEffect } from "react";
import logoLecto from "../img/logo-lecto.png";
import logoDisfam from "../img/logo-disfam.png";

import successIcon from "../img/success-icon.svg";
import pendingIcon from "../img/pending-icon.svg";
import failureIcon from "../img/failure-icon.svg";

import auth from "../auth";

import axios from "axios";
import Cookies from "universal-cookie";

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
              <img src={successIcon} alt="" />
              <span className="txt-aprobada">Aprobada!</span>
            </div>
            <div className="botones-descargar">
              <button>Descargar como PDF</button>
              <button>Descargar como JPG</button>
              <button>Obtener link de pasaporte</button>
            </div>
          </div>
        );
      case "pendiente":
        return (
          <div className="texto-pendiente">
            <div className="estado-solicitud">
              <img src={pendingIcon} alt="" />
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
              <img src={failureIcon} alt="" />
              <span className="txt-rechazado">Rechazado</span>
            </div>
            <p>Mensaje del especialista:</p>
            <p className="mensaje-especialista">{data.mensaje}</p>
          </div>
        );
    }
  };

  return (
    <>
      <nav>
        <h2>RUIDEA</h2>
        <div className="links">
          <p
            class="btn-cerrar-sesion"
            onClick={() => {
              auth.logout(() => {
                props.history.push("/");
              });
            }}
          >
            Cerrar sesión
          </p>
        </div>
      </nav>
      <main className="dashboard-main">
        <h2>Hola, {data.nombre}!</h2>
        <div className="card-estado">
          <h5>Estado de tu solicitud</h5>
          {loading ? <span>Cargando...</span> : switchData()}
        </div>
        <div className="creado-por-lecto">
          <p>Sistema creado por el equipo de LectO.</p>
          <div className="imagenes">
            <img src={logoLecto} alt="Logo LectO" />
            <img src={logoDisfam} alt="Logo Disfam" />
          </div>
        </div>
      </main>
    </>
  );
};

export default Dashboard;
