import React from "react";
import logoLecto from "../img/logo-lecto.png";
import logoDisfam from "../img/logo-disfam.png";
import successIcon from "../img/success-icon.svg";

const Dashboard = () => {
  return (
    <>
      <nav>
        <h2>Rudea</h2>
        <div className="links">
          <p class="btn-cerrar-sesion">Cerrar sesión</p>
        </div>
      </nav>
      <main className="dashboard-main">
        <h2>Hola, Nombre!</h2>
        <div className="card-estado">
          <h5>Estado de tu solicitud</h5>
          <div className="estado-solicitud">
            <img src={successIcon} alt="" />
            <span className="txt-aprobada">Aprobada!</span>
          </div>
          <div className="botones-descargar">
            <button>Descargar como PDF</button>
            <button>Descargar como JPG</button>
            <button>Obtener link de pasaporte</button>
          </div>
          {/* 
                <div className="texto-pendiente"></div>
                <div className="devolucion"></div> */}
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
