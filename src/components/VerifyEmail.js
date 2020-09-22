import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { axiosInstance } from "../axios";
import Cookies from "universal-cookie";

import LoadingScreen from "./LoadingScreen";

import logoRuideaPNG from "../img/png/logo-ruidea.png";

const VerifyEmail = (props) => {
  const cookies = new Cookies();
  const [loading, setLoading] = useState(true);
  const [verificado, setVerificado] = useState(false);
  const idUsuario = cookies.get("id");

  const fetchFromAPI = useCallback(async () => {
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
  }, [props.match.params.token]);

  useEffect(() => {
    fetchFromAPI();
  }, [fetchFromAPI]);

  return (
    <>
      {loading && <LoadingScreen />}
      <main className="main-verificar-mail">
        {verificado ? (
          <>
            <img src={logoRuideaPNG} alt="Logo RUIDEA" />
            <div className="texto">
              <h4>Su correo electrónico ha sido verificado correctamente.</h4>
              <h4>Pronto, profesionales verificarán su solicitud.</h4>
            </div>
            <Link to="/login">Iniciar sesión</Link>
          </>
        ) : (
          <>
            <h1>El link que ingresó es incorrecto o ya venció.</h1>
            {idUsuario ? (
              <button
                onClick={() => {
                  /* const resendEmail = async () => {
                  await axiosInstance.post(
                    `/emailVerification/resend/${idUsuario}`
                  );
                };
                resendEmail(); */
                  console.log(idUsuario);
                }}
              >
                Volver a enviar correo electrónico
              </button>
            ) : (
              <>
                <h1>
                  Por favor, inicie sesión y solicite que se le envíe el correo
                  electrónico nuevamente.
                </h1>
                <Link to="/login">Iniciar sesión</Link>
              </>
            )}
          </>
        )}
      </main>
    </>
  );
};

export default VerifyEmail;
