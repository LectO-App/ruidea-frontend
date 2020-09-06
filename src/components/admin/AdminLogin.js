import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { axiosInstance } from "../../axios";
import Cookies from "universal-cookie";

import AdminAuth from "./adminAuth";

const AdminLogin = (props) => {
  const { register, handleSubmit, errors } = useForm();

  const [loading, setLoading] = useState(false);

  const submitLogin = (data) => {
    AdminAuth.login(
      data,
      async () => {
        const { user, password } = data;

        await axiosInstance.post(`/admin/login`, {
          user,
          password,
        });

        const cookies = new Cookies();
        cookies.set("admin", true, { expires: 0 });
        AdminAuth.authenticated = true;
        setLoading(true);
        props.history.push("/admin/solicitudes");
      },
      () => {
        Swal.fire({
          icon: "error",
          title: "Usuario y/o contraseña incorrecto.",
        });
      }
    );
    setLoading(false);
  };

  useEffect(() => {
    AdminAuth.isAuthenticated() && props.history.push("/admin/solicitudes");
  }, []);

  return (
    <div>
      <form className="login-form" onSubmit={handleSubmit(submitLogin)}>
        <h1>Login Admin</h1>
        <div className="form-group">
          <label htmlFor="user">Usuario</label>
          <input
            type="user"
            name="user"
            id="user"
            ref={register({ required: "Por favor, ingrese un usuario" })}
          />
          {errors.user && (
            <span className="error-message">{errors.user.message}</span>
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
        </div>
        <button className="btn-iniciar-sesión" type="submit">
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
