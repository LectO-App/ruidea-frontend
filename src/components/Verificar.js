import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "./LoadingScreen";

import logoRuidea from "../img/logoRuidea.webp";

const Verificar = (props) => {
  const { nroPasaporte, nroDocumento } = props.match.params;
  const [usuario, setUsuario] = useState({});
  const [loading, setLoading] = useState(true);

  const requestToAPI = async () => {
    setLoading(true);
    const res = await axios.post(
      `https://ruidea.herokuapp.com/usuario/verificar/${nroDocumento}/${nroPasaporte}`
    );
    console.log(res);
    if (res.data.existe) {
      setUsuario(res.data.usuario);
    } else {
      props.history.push("/");
    }
    setLoading(false);
  };

  useEffect(() => {
    requestToAPI();
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      <main className="main-verificar">
        <img src={logoRuidea} alt="Logo Ruidea" className="logo-ruidea" />
        <div className="container-datos">
          <div className="texto-main">
            <h1>
              {usuario.nombre} {usuario.apellidos}
            </h1>
            <h3>{usuario.paisResidencia}</h3>
          </div>
          <h2>Pasaporte N° {usuario.numeroPasaporte}</h2>
        </div>
      </main>
      <footer className="footer-verificar">
        <p>Sistema desarrollado por LectO</p>
        <Link to="/" className="ir-a-ruidea">
          Ir a Ruidea
        </Link>
      </footer>
    </>
  );
};

export default Verificar;
