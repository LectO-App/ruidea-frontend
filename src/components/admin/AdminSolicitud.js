import React, { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../../axios";
import { Link } from "react-router-dom";

import { toast } from "../ui/toast";
import Modal from "../ui/Modal";
import StatusBadge from "./StatusBadge";
import InlineMessage from "../ui/InlineMessage";
import { getFileFromServer } from "../../util/getFileFromServer";
import { daysWaiting, diasLabel } from "../../util/waiting";
import DocumentPane from "./DocumentPane";
import ReviewChecks, { allMatch, motivosOf } from "./ReviewChecks";
import WaitingTag from "./WaitingTag";

const DIAG_LABELS = { tdah: "TDA-H" };

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const diagLabel = (d) => DIAG_LABELS[d] || d.charAt(0).toUpperCase() + d.slice(1);

const presentedBy = (user) => {
  if (!user.esTutor) return "";
  const nombre = `${user.tutorNombre || ""} ${user.tutorApellidos || ""}`.trim();
  const parentesco = (user.tutorParentesco || "").trim().toLowerCase();
  if (!nombre && !parentesco) return "";
  return ` · presentada por ${nombre}${parentesco ? (nombre ? ` (${parentesco})` : parentesco) : ""}`;
};

const AfterDecision = ({ next }) => {
  if (!next) return null;
  if (!next.siguiente) {
    return <p className="adm-after">Después: no quedan más pendientes, volverás a la lista.</p>;
  }
  const days = daysWaiting(next.siguiente);
  return (
    <p className="adm-after">
      Después: siguiente pendiente, la que más tiempo lleva esperando
      {days != null && ` (${diasLabel(days)})`}.
    </p>
  );
};

const Field = ({ label, children }) => (
  <div className="adm-field">
    <dt>{label}</dt>
    <dd>{children || "—"}</dd>
  </div>
);

const AdminSolicitud = (props) => {
  const [user, setUser] = useState({});
  const [loadError, setLoadError] = useState(false);
  // Which download is in flight ("pdf" | "img" | null) — drives per-button busy state.
  const [downloading, setDownloading] = useState(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMsg, setRevisionMsg] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [next, setNext] = useState(null);
  const id = props.match.params.id;

  // After a decision the reviewer goes on to the pending application that has waited longest.
  const goToNext = async () => {
    try {
      const res = await axiosInstance.get("/admin/siguiente", { params: { excluir: id } });
      if (res.data.siguiente) {
        props.history.push(`/admin/solicitudes/${res.data.siguiente._id}`);
        return;
      }
      toast.success("No quedan solicitudes pendientes.");
    } catch (err) {
      toast.error("No se pudo abrir la siguiente solicitud pendiente.");
    }
    props.history.push("/admin/solicitudes");
  };

  const postResultToAPI = async (estado, mensajeMedico = "") => {
    try {
      await axiosInstance.post(`/admin/respuesta`, {
        estado,
        mensajeMedico,
        emailUsuario: user.correoElectronico,
      });
    } catch (error) {
      toast.error("Hubo un error al mandar la respuesta.");
      return;
    }
    toast.success("Respuesta enviada");
    await goToNext();
  };

  const sendRevision = () => {
    setRevisionOpen(false);
    postResultToAPI("revision", revisionMsg);
  };

  const getUserFromAPI = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await axiosInstance.post(`/admin/solicitudes/${id}`);
      setUser(res.data.usuario);
    } catch (err) {
      setLoadError(true);
    }
  }, [id]);

  useEffect(() => {
    getUserFromAPI();
  }, [getUserFromAPI]);

  const pendiente = user.estado === "pendiente";
  useEffect(() => {
    if (!pendiente) return;
    axiosInstance
      .get("/admin/siguiente", { params: { excluir: id } })
      .then((res) => setNext(res.data))
      .catch(() => setNext(null));
  }, [pendiente, id]);

  const downloadFile = async (type) => {
    setDownloading(type);
    try {
      await getFileFromServer(type, user._id);
    } finally {
      setDownloading(null);
    }
  };

  if (loadError) {
    return (
      <div className="adm adm-detail">
        <div className="adm-detail__shell">
          <div className="adm-detail__top">
            <Link className="adm-back" to="/admin/solicitudes">
              ← Volver a solicitudes
            </Link>
          </div>
          <InlineMessage type="error">
            No se pudo cargar la solicitud.{" "}
            <button className="adm-link" onClick={getUserFromAPI}>
              Reintentar
            </button>
          </InlineMessage>
        </div>
      </div>
    );
  }

  if (!user._id) return <DetailSkeleton />;

  const diagnosticos = user.diagnostico
    ? Object.keys(user.diagnostico).filter((k) => user.diagnostico[k])
    : [];
  const motivos = motivosOf(answers);
  const canAccept = allMatch(answers);
  const acceptBlocked = motivos.length
    ? "Hay puntos que no coinciden: pide revisión o rechaza."
    : "Marca los 5 puntos como «Coincide» primero.";
  const checkValues = {
    nombre: `${user.nombre || ""} ${user.apellidos || ""}`.trim(),
    documento: user.numeroDocumento,
    fechaNacimiento: user.fechaNacimiento && fmtDate(user.fechaNacimiento),
    diagnostico: diagnosticos.map(diagLabel).join(", ") || "Sin diagnóstico indicado",
  };

  return (
    <div className="adm adm-detail">
      <div className="adm-review">
        <div className="adm-detail__top adm-review__top">
          <Link className="adm-back" to="/admin/solicitudes">
            ← Volver a solicitudes
          </Link>
          <StatusBadge item={user} />
        </div>

        <div className="adm-review__doc">
          <DocumentPane user={user} />
        </div>

        <div className="adm-review__data">
        <header className="adm-detail__head">
          <h1>
            {user.nombre} {user.apellidos}
          </h1>
          <p className="adm-detail__sub">
            {user.fechaEnvio ? `Enviada el ${fmtDate(user.fechaEnvio)}` : `Creada el ${fmtDate(user.fechaCreacion)}`}
            {presentedBy(user)}
          </p>
          {pendiente && <WaitingTag item={user} />}
        </header>

        {pendiente && (
          <>
            <ReviewChecks
              answers={answers}
              values={checkValues}
              onAnswer={(key, value) => setAnswers((a) => ({ ...a, [key]: value }))}
            />
            <div className="adm-actionbar adm-actionbar--review">
              <button
                className="adm-btn adm-btn--ghost"
                onClick={() => {
                  setRevisionMsg(motivos.join("\n"));
                  setRevisionOpen(true);
                }}
              >
                Pedir revisión
                {motivos.length > 0 && ` (${motivos.length} ${motivos.length === 1 ? "motivo" : "motivos"})`}
              </button>
              <button className="adm-btn adm-btn--reject" onClick={() => setRejectOpen(true)}>
                Rechazar
              </button>
              <span className="adm-accept">
                <button
                  className="adm-btn adm-btn--accept"
                  onClick={() => postResultToAPI("aceptado")}
                  disabled={!canAccept}
                  aria-describedby={canAccept ? undefined : "accept-blocked"}
                >
                  Aceptar solicitud
                </button>
                {!canAccept && (
                  <span className="adm-accept__why" id="accept-blocked">
                    {acceptBlocked}
                  </span>
                )}
              </span>
              <Link to={`/admin/solicitudes/${id}/modificar`} className="adm-link adm-actionbar__modify">
                Modificar datos
              </Link>
            </div>
            <AfterDecision next={next} />
          </>
        )}

        <section className="adm-card">
          <h2 className="adm-card__title">Identidad</h2>
          <dl className="adm-grid">
            <Field label="Nombre completo">
              {user.nombre} {user.apellidos}
            </Field>
            <Field label="DNI o documento">{user.numeroDocumento}</Field>
            <Field label="Fecha de nacimiento">{fmtDate(user.fechaNacimiento)}</Field>
            <Field label="Lugar de nacimiento">{user.lugarNacimiento}</Field>
          </dl>
        </section>

        {user.esTutor && (
          <section className="adm-card">
            <h2 className="adm-card__title">Presentada por (tutor/representante)</h2>
            <dl className="adm-grid">
              <Field label="Nombre del tutor/a">
                {user.tutorNombre} {user.tutorApellidos}
              </Field>
              <Field label="Relación con la persona">{user.tutorParentesco}</Field>
            </dl>
          </section>
        )}

        <section className="adm-card">
          <h2 className="adm-card__title">Residencia y contacto</h2>
          <dl className="adm-grid">
            <Field label="País de residencia">{user.paisResidencia}</Field>
            <Field label="Localidad">{user.localidadResidencia}</Field>
            <Field label="Correo electrónico">{user.correoElectronico}</Field>
            <Field label="Teléfono">{user.numeroTelefono}</Field>
          </dl>
        </section>

        <section className="adm-card">
          <h2 className="adm-card__title">Diagnóstico</h2>
          <div className="adm-chips">
            {diagnosticos.length ? (
              diagnosticos.map((d) => (
                <span className="adm-chip" key={d}>
                  {diagLabel(d)}
                </span>
              ))
            ) : (
              <span className="adm-muted">Sin diagnóstico indicado</span>
            )}
          </div>
        </section>

        <section className="adm-card">
          <h2 className="adm-card__title">Consentimientos</h2>
          <dl className="adm-grid">
            <Field label="Política de protección de datos">Aceptada</Field>
            <Field label="Recibir información sobre DEA">
              {user.aceptoRecibirInfo ? "Sí" : "No"}
            </Field>
          </dl>
        </section>

        {user.estado === "aceptado" && (
          <div className="adm-actionbar">
            <Link
              to={`/admin/solicitudes/${id}/modificar`}
              className="adm-btn adm-btn--ghost"
            >
              Modificar datos
            </Link>
            <button
              className="adm-btn adm-btn--primary"
              onClick={() => downloadFile("pdf")}
              disabled={downloading === "pdf"}
            >
              {downloading === "pdf" ? "Generando…" : "Certificado PDF"}
            </button>
            <button
              className="adm-btn adm-btn--ghost"
              onClick={() => downloadFile("img")}
              disabled={downloading === "img"}
            >
              {downloading === "img" ? "Generando…" : "Certificado JPG"}
            </button>
          </div>
        )}
        </div>

        <Modal open={rejectOpen} onClose={() => setRejectOpen(false)} title="Rechazar solicitud">
          <p className="adm-confirm-text">
            ¿Seguro que quieres rechazar la solicitud de{" "}
            <strong>
              {user.nombre} {user.apellidos}
            </strong>
            ? Se le notificará al usuario por correo y esta acción cambia el estado de la solicitud.
          </p>
          <div className="modal-actions">
            <button className="adm-btn adm-btn--ghost" onClick={() => setRejectOpen(false)}>
              Cancelar
            </button>
            <button
              className="adm-btn adm-btn--reject"
              onClick={() => {
                setRejectOpen(false);
                postResultToAPI("rechazado");
              }}
            >
              Sí, rechazar
            </button>
          </div>
        </Modal>

        <Modal open={revisionOpen} onClose={() => setRevisionOpen(false)} title="Pedir revisión de solicitud">
          <label className="adm-modal-label" htmlFor="revision-msg">
            Mensaje para el usuario
          </label>
          {motivos.length > 0 && (
            <p className="adm-modal-help">Los puntos que marcaste con «No» ya están escritos. Puedes cambiar el mensaje.</p>
          )}
          <textarea
            id="revision-msg"
            className="modal-textarea"
            value={revisionMsg}
            onChange={(e) => setRevisionMsg(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") sendRevision();
            }}
          />
          <div className="modal-actions">
            <button className="adm-btn adm-btn--ghost" onClick={() => setRevisionOpen(false)}>
              Cancelar
            </button>
            <button
              className="adm-btn adm-btn--primary"
              onClick={sendRevision}
            >
              Enviar
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

// Loading placeholder that mirrors the detail layout (back bar, title, stacked cards) so
// nothing reflows when the real solicitud arrives. Shimmer pauses under reduced motion.
const DetailSkeleton = () => (
  <div className="adm adm-detail">
    <div className="adm-detail__shell" aria-busy="true" aria-live="polite">
      <span className="sk-sr">Cargando la solicitud…</span>
      <div className="adm-detail__top" aria-hidden="true">
        <span className="sk adm-sk-back" />
        <span className="sk adm-sk-badge" />
      </div>
      <div aria-hidden="true">
        <span className="sk adm-sk-h1" />
        <span className="sk adm-sk-sub" />
      </div>
      {[0, 1, 2].map((c) => (
        <div className="adm-card" key={c} aria-hidden="true">
          <span className="sk adm-sk-card-title" />
          <div className="adm-grid">
            {[0, 1, 2, 3].map((f) => (
              <div className="adm-field" key={f}>
                <span className="sk adm-sk-label" />
                <span className="sk adm-sk-value" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Keyed by id so moving on to the next pending application starts with fresh answers.
const AdminSolicitudRoute = (props) => <AdminSolicitud key={props.match.params.id} {...props} />;

export default AdminSolicitudRoute;
