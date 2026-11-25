import React, { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../../axios";
import { Link } from "react-router-dom";

import { toast } from "../ui/toast";
import Modal from "../ui/Modal";
import StatusBadge from "./StatusBadge";
import InlineMessage from "../ui/InlineMessage";
import { getFileFromServer } from "../../util/getFileFromServer";
import { GRUPOS, MOTIVOS, OTRO_MAX, grupoLabel, isOtro } from "../../util/motivosRevision";
import { isPdfDocuments } from "../../util/documents";

const DIAG_LABELS = { tdah: "TDA-H" };

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" }) : "—";

const docsLabel = (archivoBlob, busy) => {
  if (!archivoBlob) return "Sin documentos subidos";
  if (isPdfDocuments(archivoBlob)) return busy ? "Abriendo…" : "Abrir diagnóstico e identificación (PDF, pestaña nueva)";
  return busy ? "Descargando…" : "Descargar diagnóstico e identificación (ZIP)";
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
  // Which download is in flight ("pdf" | "img" | "docs" | null) — drives per-button busy state.
  const [downloading, setDownloading] = useState(null);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [revisionMsg, setRevisionMsg] = useState("");
  const [revisionMotivos, setRevisionMotivos] = useState([]);
  const [textosOtro, setTextosOtro] = useState({}); // the text of each "Otro" reason, by id
  const [revisionError, setRevisionError] = useState(null);
  const [rejectOpen, setRejectOpen] = useState(false);

  const postResultToAPI = async (estado, mensajeMedico = "", motivosRevision = [], textos = {}) => {
    try {
      await axiosInstance.post(`/admin/respuesta`, {
        estado,
        mensajeMedico,
        motivosRevision,
        textosOtro: textos,
        emailUsuario: user.correoElectronico,
      });
      toast.success("Respuesta enviada");
      props.history.push("/admin/solicitudes");
    } catch (error) {
      toast.error("Hubo un error al mandar la respuesta.");
    }
  };

  const toggleMotivo = (id) => {
    setRevisionError(null);
    setRevisionMotivos((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  };

  const sendRevision = () => {
    if (revisionMotivos.length === 0 && !revisionMsg.trim()) {
      setRevisionError("Elige al menos un motivo o escribe un mensaje.");
      return;
    }
    const ordered = MOTIVOS.map((m) => m.id).filter((id) => revisionMotivos.includes(id));
    const otros = ordered.filter(isOtro);
    const missing = otros.find((id) => !(textosOtro[id] || "").trim());
    if (missing) {
      setRevisionError("Escribe qué hay que cambiar en cada «Otro».");
      const input = document.getElementById(`otro-${missing}`);
      if (input) input.focus();
      return;
    }
    setRevisionOpen(false);
    const textos = Object.fromEntries(otros.map((id) => [id, textosOtro[id].trim()]));
    postResultToAPI("revision", revisionMsg, ordered, textos);
  };

  const getUserFromAPI = useCallback(async () => {
    setLoadError(false);
    try {
      const res = await axiosInstance.post(`/admin/solicitudes/${props.match.params.id}`);
      setUser(res.data.usuario);
    } catch (err) {
      setLoadError(true);
    }
  }, [props.match.params.id]);

  useEffect(() => {
    getUserFromAPI();
  }, [getUserFromAPI]);

  const downloadFile = async (type) => {
    setDownloading(type);
    try {
      await getFileFromServer(type, user._id);
    } finally {
      setDownloading(null);
    }
  };

  // New uploads are one PDF the browser shows in a new tab; older records are a ZIP to download.
  const openDocs = async () => {
    setDownloading("docs");
    try {
      const res = await axiosInstance.get(`/inscripcion/link-archivos/${user._id}`);
      const link = document.createElement("a");
      link.href = res.data.url;
      link.target = "_blank";
      link.rel = "noopener";
      link.click();
    } catch (err) {
      toast.error("No se encontraron documentos para este usuario.");
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

  const diagnosticos = user.diagnostico ? Object.keys(user.diagnostico).filter((k) => user.diagnostico[k]) : [];
  const pedidos = MOTIVOS.filter((m) => (user.motivosRevision || []).includes(m.id));
  const cambios = user.cambiosDesdeRevision || [];

  return (
    <div className="adm adm-detail">
      <div className="adm-detail__shell">
        <div className="adm-detail__top">
          <Link className="adm-back" to="/admin/solicitudes">
            ← Volver a solicitudes
          </Link>
          <StatusBadge item={user} />
        </div>

        <header className="adm-detail__head">
          <h1>
            {user.nombre} {user.apellidos}
          </h1>
          <p className="adm-detail__sub">Solicitud de pasaporte DEA · creada el {fmtDate(user.fechaCreacion)}</p>
        </header>

        {(pedidos.length > 0 || cambios.length > 0) && (
          <section className="adm-card">
            <h2 className="adm-card__title">Revisión</h2>
            {pedidos.length > 0 && (
              <>
                <h3 className="adm-card__subtitle">Lo que se pidió cambiar</h3>
                <ul className="adm-revision-list">
                  {pedidos.map((m) => (
                    <li key={m.id}>
                      {m.admin}
                      {m.otro && user.textosOtro && user.textosOtro[m.id] ? `: ${user.textosOtro[m.id]}` : ""}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {cambios.length > 0 && (
              <>
                <h3 className="adm-card__subtitle">Qué cambió</h3>
                <ul className="adm-chips adm-chips--list">
                  {cambios.map((g) => (
                    <li className="adm-chip" key={g}>
                      {grupoLabel(g)}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
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
                  {DIAG_LABELS[d] || d.charAt(0).toUpperCase() + d.slice(1)}
                </span>
              ))
            ) : (
              <span className="adm-muted">Sin diagnóstico indicado</span>
            )}
          </div>
          <button
            className="adm-btn adm-btn--ghost adm-doc-btn"
            onClick={openDocs}
            disabled={!user.archivoBlob || downloading === "docs"}
          >
            {docsLabel(user.archivoBlob, downloading === "docs")}
          </button>
        </section>

        <section className="adm-card">
          <h2 className="adm-card__title">Consentimientos</h2>
          <dl className="adm-grid">
            <Field label="Política de protección de datos">Aceptada</Field>
            <Field label="Recibir información sobre DEA">{user.aceptoRecibirInfo ? "Sí" : "No"}</Field>
          </dl>
        </section>

        {user.estado === "pendiente" && (
          <div className="adm-actionbar">
            <button className="adm-btn adm-btn--accept" onClick={() => postResultToAPI("aceptado")}>
              Aceptar solicitud
            </button>
            <Link to={`/admin/solicitudes/${props.match.params.id}/modificar`} className="adm-btn adm-btn--ghost">
              Modificar datos
            </Link>
            <button
              className="adm-btn adm-btn--ghost"
              onClick={() => {
                setRevisionMsg("");
                setRevisionMotivos([]);
                setTextosOtro({});
                setRevisionError(null);
                setRevisionOpen(true);
              }}
            >
              Pedir revisión
            </button>
            <button className="adm-btn adm-btn--reject" onClick={() => setRejectOpen(true)}>
              Rechazar
            </button>
          </div>
        )}

        {user.estado === "aceptado" && (
          <div className="adm-actionbar">
            <Link to={`/admin/solicitudes/${props.match.params.id}/modificar`} className="adm-btn adm-btn--ghost">
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
          <fieldset className="adm-motivos">
            <legend className="adm-modal-label">¿Qué tiene que cambiar la persona?</legend>
            {GRUPOS.map((g) => (
              <fieldset className="adm-motivos__group" key={g.key}>
                <legend>{g.label}</legend>
                {MOTIVOS.filter((m) => m.grupo === g.key).map((m) => {
                  const checked = revisionMotivos.includes(m.id);
                  const texto = textosOtro[m.id] || "";
                  const inputId = `otro-${m.id}`;
                  return (
                    <React.Fragment key={m.id}>
                      <label className="adm-motivo">
                        <input type="checkbox" checked={checked} onChange={() => toggleMotivo(m.id)} />
                        <span>{m.admin}</span>
                      </label>
                      {m.otro && checked && (
                        <div className="adm-otro">
                          <label htmlFor={inputId}>Qué tiene que cambiar (obligatorio)</label>
                          <input
                            id={inputId}
                            type="text"
                            required
                            aria-required="true"
                            aria-describedby={`${inputId}-count`}
                            maxLength={OTRO_MAX}
                            value={texto}
                            onChange={(e) => {
                              setRevisionError(null);
                              setTextosOtro((prev) => ({ ...prev, [m.id]: e.target.value }));
                            }}
                          />
                          <span className="adm-otro__count" id={`${inputId}-count`}>
                            {texto.length} de {OTRO_MAX}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </fieldset>
            ))}
          </fieldset>
          <label className="adm-modal-label" htmlFor="revision-msg">
            Mensaje para la persona (opcional)
          </label>
          <textarea
            id="revision-msg"
            className="modal-textarea"
            value={revisionMsg}
            onChange={(e) => {
              setRevisionError(null);
              setRevisionMsg(e.target.value);
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") sendRevision();
            }}
          />
          <InlineMessage type="error">{revisionError}</InlineMessage>
          <div className="modal-actions">
            <button className="adm-btn adm-btn--ghost" onClick={() => setRevisionOpen(false)}>
              Cancelar
            </button>
            <button className="adm-btn adm-btn--primary" onClick={sendRevision}>
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

export default AdminSolicitud;
