import React from "react";
import { useForm } from "react-hook-form";

import axios from "axios";

import { Link } from "react-router-dom";

import auth from "../auth";

import Cookies from "universal-cookie";

const Login = (props) => {
  const cookies = new Cookies();
  const { register, handleSubmit, errors } = useForm();
  // eslint-disable-next-line
  const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  const loginSuccess = async (data) => {
    const res = await axios.post(
      "https://ruidea.herokuapp.com/usuario/login",
      data
    );
    /* if (res.status === 401) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "No se encontró ningún usuario con ese email o numero de pasaporte.",
      });
    } */
    if (res.status === 200) {
      auth.login(() => {
        cookies.set(
          "logged-in",
          { bool: true, _id: res.data._id },
          { path: "/", expires: 0 }
        );
        props.history.push("/dashboard");
      });
    } else {
    }
  };

  return (
    <div>
      <Link className="cross" to="/"></Link>
      <form className="login-form" onSubmit={handleSubmit(loginSuccess)}>
        <h1 className="titulo-iniciar-sesion">Iniciar sesión</h1>
        <div className="form-group">
          <label htmlFor="email">Correo electrónico</label>
          <input
            type="text"
            name="user"
            id="user"
            ref={register({
              required: "Por favor, ingrese un correo electrónico",
              pattern: {
                message:
                  "Por favor, ingrese un correo electrónico o número de pasaporte válido",
                value: emailRegex,
              },
            })}
          />
          {errors.email && (
            <span className="error-message">{errors.email.message}</span>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            name="password"
            id="password"
            ref={register({ required: "Por favor, ingrese una contraseña" })}
          />
          {errors.password && (
            <span className="error-message">{errors.password.message}</span>
          )}
          <p className="olvide-contraseña">Olvidé mi contraseña</p>
        </div>
        <button className="btn-iniciar-sesión">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
