import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../axios";
import LoadingScreen from "./LoadingScreen";

import logoRuidea from "../img/logoRuidea.webp";

const Verificar = (props) => {
  const { nroPasaporte, nroDocumento } = props.match.params;
  const [usuario, setUsuario] = useState({});
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState("");
  const [error, setError] = useState(false);

  const requestToAPI = async () => {
    setLoading(true);
    const res = await axiosInstance.post(
      `/usuario/verificar/${nroDocumento}/${nroPasaporte}`
    );
    console.log(res);
    if (res.data.existe) {
      setUsuario(res.data.usuario);
    } else {
      setError(true);
    }
    if (res.data.usuario) {
      const string = new Date(Date.parse(res.data.usuario.fechaNacimiento))
        .toISOString()
        .split("-");

      setFecha(`${string[2].split("T")[0]}/${string[1]}/${string[0]}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    requestToAPI();
  }, []);

  return (
    <>
      {error && (
        <div className="error-screen">
          <h1>
            No se encontró un usuario con ese documento. Por favor revise que
            haya ingresado los datos correctamente.
          </h1>
          <Link to="/">Ir al inicio</Link>
        </div>
      )}
      {loading && <LoadingScreen />}
      <header className="header-verificar">
        <p className="pais">{usuario.paisResidencia}</p>
        <h1>PASAPORTE DEA</h1>
      </header>

      <main className="main-verificar">
        <h2 className="pasaporte">Pasaporte N° {usuario.numeroPasaporte}</h2>
        <div className="flex">
          <div className="container-logo-ruidea">
            <img src={logoRuidea} alt="Logo Ruidea" className="logo-ruidea" />
          </div>
          <div className="container-datos">
            <div className="texto-main">
              <h1>
                {usuario.nombre} {usuario.apellidos}
              </h1>
              <h3>{fecha}</h3>
              <h2>{usuario.numeroDocumento}</h2>
            </div>
          </div>
        </div>
        <h2 className="desarrollado-por-lecto">
          Sistema desarrollado por el equipo de{" "}
          <a href="https://lecto.app" target="_blank" rel="noopener noreferrer">
            LectO
          </a>
        </h2>
      </main>
      <footer className="footer-verificar">
        <p>
          Rogamos tengan en consideración las circunstancias que concurren en la
          persona portadora de este documento, asi cómo lo derechos recogidos en
          la legislación vigente
        </p>
      </footer>
    </>
  );
};

export default Verificar;
