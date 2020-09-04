import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../axios";

import LoadingScreen from "./LoadingScreen";

import logoRuidea from "../img/logoRuidea.webp";

const VerifyEmail = (props) => {
  const [loading, setLoading] = useState(true);
  const [verificado, setVerificado] = useState(false);

  useEffect(() => {
    const fetchFromAPI = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.post(
          `/emailVerification/confirm/${props.match.params.token}`
        );
        if (res.status === 200) {
          setVerificado(true);
        }
      } catch (err) {
        setVerificado(false);
      }
      setLoading(false);
    };
    fetchFromAPI();
  }, []);

  return (
    <>
      {loading && <LoadingScreen />}
      <main className="main-verificar-mail">
        {verificado ? (
          <>
            <img src={logoRuidea} alt="Logo RUIDEA" />
            <div className="texto">
              <h4>Su correo electrónico ha sido verificado correctamente.</h4>
              <h4>Pronto, profesionales verificarán su solicitud.</h4>
            </div>
            <Link to="/login">Iniciar sesión</Link>
          </>
        ) : (
          <h1>No verificado</h1>
        )}
      </main>
    </>
  );
};

export default VerifyEmail;
