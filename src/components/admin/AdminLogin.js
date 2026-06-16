import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

import AdminAuth from "./adminAuth";
import InlineMessage from "../ui/InlineMessage";

import "../../css/registration.scss";

const AdminLogin = (props) => {
  const { register, handleSubmit, errors } = useForm({ mode: "onBlur" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reveal, setReveal] = useState(false);

  const submitLogin = async (data) => {
    setLoading(true);
    setError(null);
    await AdminAuth.login(
      data,
      () => props.history.push("/admin/solicitudes"),
      () => setError("Usuario y/o contraseña incorrecto.")
    );
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      if (await AdminAuth.isAuthenticated()) props.history.push("/admin/solicitudes");
    })();
  }, [props.history]);

  return (
    <div className="reg auth">
      <div className="auth-shell">
        <div className="reg-step auth-card">
          <header className="auth-head">
            <h1 className="auth-title">Panel de administración</h1>
            <p className="auth-sub">Inicia sesión para gestionar las solicitudes.</p>
          </header>

          <form className="step-form" onSubmit={handleSubmit(submitLogin)} noValidate>
            <div className={`field${errors.user ? " has-error" : ""}`}>
              <label htmlFor="user">Usuario</label>
              <input
                type="text"
                name="user"
                id="user"
                autoFocus
                autoComplete="username"
                aria-invalid={errors.user ? "true" : "false"}
                ref={register({ required: "Ingresa tu usuario" })}
              />
              {errors.user && (
                <span className="error-message" role="alert">
                  {errors.user.message}
                </span>
              )}
            </div>

            <div className={`field${errors.password ? " has-error" : ""}`}>
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input
                  type={reveal ? "text" : "password"}
                  name="password"
                  id="password"
                  autoComplete="current-password"
                  aria-invalid={errors.password ? "true" : "false"}
                  ref={register({ required: "Ingresa tu contraseña" })}
                />
                <button
                  type="button"
                  className="reveal-btn"
                  aria-label={reveal ? "Ocultar contraseña" : "Mostrar contraseña"}
                  aria-pressed={reveal}
                  onClick={() => setReveal((r) => !r)}
                >
                  {reveal ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message" role="alert">
                  {errors.password.message}
                </span>
              )}
            </div>

            <InlineMessage type="error">{error}</InlineMessage>

            <button type="submit" className="btn-primary auth-submit" disabled={loading}>
              {loading ? "Entrando…" : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
