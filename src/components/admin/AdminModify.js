import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { axiosInstance } from "../../axios";

import { toast } from "../ui/toast";
import InlineMessage from "../ui/InlineMessage";

import "../../css/registration.scss";

const PAISES = [
  "Andorra", "Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica",
  "Cuba", "Ecuador", "El Salvador", "España", "Guatemala", "México", "Nicaragua",
  "Panamá", "Paraguay", "Perú", "Portugal", "República Dominicana", "Uruguay", "Venezuela",
];

const DIAGS = [
  { name: "dislexia", label: "Dislexia" },
  { name: "discalculia", label: "Discalculia" },
  { name: "disortografía", label: "Disortografía" },
  { name: "dispraxia", label: "Dispraxia" },
  { name: "tdah", label: "TDA-H" },
];

const emailRegex =
  // eslint-disable-next-line no-control-regex
  /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

const AdminModify = (props) => {
  const { id } = props.match.params;
  const [user, setUser] = useState({});
  const [error, setError] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [pais, setPais] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, errors } = useForm({ mode: "onBlur" });

  const getUserFromAPI = useCallback(async () => {
    try {
      const res = await axiosInstance.post(`/admin/solicitudes/${id}`);
      setUser(res.data.usuario);
      setPais(res.data.usuario.paisResidencia);
      setError(false);
    } catch (err) {
      setError(true);
    }
  }, [id]);

  useEffect(() => {
    getUserFromAPI();
  }, [getUserFromAPI]);

  const sendDataToAPI = async (data) => {
    if (loading) return; // guard double-submit
    setLoading(true);
    setSaveError(null);
    const numeroPasaporte = data.numeroPasaporte > 0 ? data.numeroPasaporte : null;
    const dataToSend = { ...data, id, estado: "aceptado", paisResidencia: pais, numeroPasaporte };
    try {
      const res = await axiosInstance.post("/admin/modificarSolicitud", dataToSend);
      if (res.status === 200) {
        toast.success("Solicitud guardada y aceptada");
        props.history.push("/admin/solicitudes");
      }
    } catch (err) {
      setSaveError("No se pudo guardar la solicitud.");
    }
    setLoading(false);
  };

  if (error) {
    return (
      <div className="reg">
        <div className="reg-shell">
          <Link className="reg-close" to={`/admin/solicitudes/${id}`} role="button" aria-label="Cerrar" />
          <InlineMessage type="error">
            No se encontró el usuario solicitado.{" "}
            <button className="adm-link" onClick={getUserFromAPI}>
              Reintentar
            </button>
          </InlineMessage>
        </div>
      </div>
    );
  }

  // Wait for the fetch before mounting the form: the inputs are uncontrolled, so their
  // defaultValues are only read once on mount — rendering early would leave them blank.
  if (!user._id) return <ModifySkeleton id={id} />;

  const field = (name, label, opts = {}) => (
    <div className={`field${errors[name] ? " has-error" : ""}`}>
      <label htmlFor={name}>{label}</label>
      <input
        type={opts.type || "text"}
        name={name}
        id={name}
        autoFocus={opts.autoFocus}
        defaultValue={opts.defaultValue}
        aria-invalid={errors[name] ? "true" : "false"}
        ref={register(opts.rules || { required: "Rellena este campo" })}
      />
      {errors[name] && (
        <span className="error-message" role="alert">
          {errors[name].message}
        </span>
      )}
    </div>
  );

  return (
    <div className="reg">
      <div className="reg-shell adm-modify">
        <Link className="reg-close" to={`/admin/solicitudes/${id}`} role="button" aria-label="Cerrar" />
        <header className="adm-modify__head">
          <h1>Modificar solicitud</h1>
          <p className="adm-modify__sub">
            {user.nombre} {user.apellidos}
          </p>
        </header>

        <form className="step-form" onSubmit={handleSubmit(sendDataToAPI)} noValidate>
          <div className="field-row">
            {field("nombre", "Nombre", {
              autoFocus: true,
              defaultValue: user.nombre,
              rules: { required: "Rellena este campo", pattern: { value: /[a-zA-Z]/, message: "Solo letras y espacios." } },
            })}
            {field("apellidos", "Apellidos", {
              defaultValue: user.apellidos,
              rules: { required: "Rellena este campo", pattern: { value: /[a-zA-Z]/, message: "Solo letras y espacios." } },
            })}
          </div>

          <div className="field-row">
            <div className={`field${errors.paisResidencia ? " has-error" : ""}`}>
              <label htmlFor="paisResidencia">País de residencia</label>
              <select
                name="paisResidencia"
                id="paisResidencia"
                ref={register({ required: "Rellena este campo" })}
                value={pais}
                onChange={(e) => setPais(e.target.value)}
                aria-invalid={errors.paisResidencia ? "true" : "false"}
              >
                <option value="" disabled>
                  Seleccione un país
                </option>
                {PAISES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              {errors.paisResidencia && (
                <span className="error-message" role="alert">
                  {errors.paisResidencia.message}
                </span>
              )}
            </div>
            {field("localidadResidencia", "Localidad", { defaultValue: user.localidadResidencia })}
          </div>

          <div className="field-row">
            {field("lugarNacimiento", "Lugar de nacimiento", {
              defaultValue: user.lugarNacimiento,
            })}
            {field("fechaNacimiento", "Fecha de nacimiento", {
              type: "date",
              defaultValue: user.fechaNacimiento ? user.fechaNacimiento.substring(0, 10) : "",
            })}
          </div>

          <div className="field-row">
            {field("numeroDocumento", "Número de documento", { defaultValue: user.numeroDocumento })}
            {field("numeroTelefono", "Teléfono móvil", {
              defaultValue: user.numeroTelefono,
              rules: {
                required: "Rellena este campo",
                pattern: { value: /^[0-9+ ]+$/gm, message: "Número de teléfono no válido." },
              },
            })}
          </div>

          <div className="field-row">
            {field("correoElectronico", "Correo electrónico", {
              defaultValue: user.correoElectronico,
              rules: {
                required: "Rellena este campo",
                pattern: { value: emailRegex, message: "Dirección de correo no válida." },
              },
            })}
            {field("numeroPasaporte", "Número de pasaporte RUIDEA", { defaultValue: user.numeroPasaporte })}
          </div>

          <fieldset className="diagnosis adm-diag">
            <legend>Dificultades</legend>
            <div className="adm-checks">
              {DIAGS.map((d) => (
                <label className="adm-check" key={d.name} htmlFor={d.name}>
                  <input
                    type="checkbox"
                    name={d.name}
                    id={d.name}
                    defaultChecked={user.diagnostico?.[d.name]}
                    ref={register()}
                  />
                  <span>{d.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <InlineMessage type="error">{saveError}</InlineMessage>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? "Guardando…" : "Guardar y aceptar solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Mirrors the modify form (header + four field rows + button) so the screen doesn't reflow
// when the solicitud loads. Shimmer pauses under prefers-reduced-motion.
const ModifySkeleton = ({ id }) => (
  <div className="reg">
    <div className="reg-shell adm-modify" aria-busy="true" aria-live="polite">
      <span className="sk-sr">Cargando la solicitud…</span>
      <Link className="reg-close" to={`/admin/solicitudes/${id}`} role="button" aria-label="Cerrar" />
      <header className="adm-modify__head" aria-hidden="true">
        <span className="sk adm-sk-h1" />
        <span className="sk adm-sk-sub" />
      </header>
      <div className="step-form" aria-hidden="true">
        {[0, 1, 2, 3].map((row) => (
          <div className="field-row" key={row}>
            {[0, 1].map((col) => (
              <div className="sk-field" key={col}>
                <span className="sk sk-label" />
                <span className="sk sk-input" />
              </div>
            ))}
          </div>
        ))}
        <span className="sk sk-button" />
      </div>
    </div>
  </div>
);

export default AdminModify;
