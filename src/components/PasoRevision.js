import React, { useEffect, useState } from "react";
import { BsArrowLeft, BsPencil, BsCheckCircle, BsExclamationCircle, BsInfoCircle } from "react-icons/bs";
import { isPdfDocuments } from "../util/documents";
import { edad, fechaCorta, fechaEnPalabras } from "../util/identity";
import { fetchPassportSample } from "../util/registrationApi";

const DIAG_LABELS = {
  dislexia: "Dislexia",
  discalculia: "Discalculia",
  disortografía: "Disortografía",
  dispraxia: "Dispraxia",
  tdah: "TDA-H",
};

const DOC_LABELS = { dni: "DNI", nie: "NIE", pasaporte: "Pasaporte" };

// The sample passport image as { status: "loading" | "ready" | "error", url }. Without all
// five printed fields, or when the server cannot draw it, the status is "error" and the
// step hides the image, so the person can always send.
const usePassportSample = ({ nombre, apellidos, fechaNacimiento, numeroDocumento, paisResidencia }) => {
  const complete = Boolean(nombre && apellidos && fechaNacimiento && numeroDocumento && paisResidencia);
  const [sample, setSample] = useState({ status: complete ? "loading" : "error" });

  useEffect(() => {
    if (!complete) {
      setSample({ status: "error" });
      return undefined;
    }
    let active = true;
    let url;
    setSample({ status: "loading" });
    fetchPassportSample({ nombre, apellidos, fechaNacimiento, numeroDocumento, paisResidencia }).then(
      (blob) => {
        if (!active) return;
        url = URL.createObjectURL(blob);
        setSample({ status: "ready", url });
      },
      () => active && setSample({ status: "error" })
    );
    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [complete, nombre, apellidos, fechaNacimiento, numeroDocumento, paisResidencia]);

  return [sample, () => setSample({ status: "error" })];
};

const Check = ({ id, title, value, hint, aviso, onFix }) => (
  <li className={`review-check${aviso ? " aviso" : ""}`} role="group" aria-labelledby={`check-${id}`}>
    <div className="review-check-body">
      <h3 id={`check-${id}`}>{title}</h3>
      <p className={`review-check-value review-check-value--${id}`}>{value || <span className="review-missing">Sin completar</span>}</p>
      <p className="review-check-hint">{hint}</p>
      {aviso && (
        <p className="review-check-aviso">
          <BsInfoCircle aria-hidden="true" /> {aviso}
        </p>
      )}
    </div>
    <button type="button" className="edit-link" onClick={onFix}>
      <BsPencil aria-hidden="true" /> Corregir<span className="sk-sr"> {title.toLowerCase()}</span>
    </button>
  </li>
);

const Row = ({ label, value }) => (
  <div className="review-row">
    <dt>{label}</dt>
    <dd>{value || <span className="review-missing">Sin completar</span>}</dd>
  </div>
);

// Final review (§1): a sample of the person's own passport and three checks of the data
// printed on it, then a calm summary with per-section "Editar" so people can check their
// work without re-navigating the whole flow, then one clear primary action.
const PasoRevision = (props) => {
  const { formData, files, editing, docMode, onBack, onSubmit, jumpToStep } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sample, onSampleError] = usePassportSample(formData);

  const diag = formData.diagnostico || {};
  const seleccionados = Object.keys(DIAG_LABELS).filter((k) => diag[k]);

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit();
    } catch (e) {
      setError(e.message || "No hemos podido enviar tu solicitud. Inténtalo otra vez.");
    }
    setLoading(false);
  };

  const EditButton = ({ step }) => (
    <button type="button" className="edit-link" onClick={() => jumpToStep(step)}>
      <BsPencil aria-hidden="true" /> Editar
    </button>
  );

  const nombreCompleto = [formData.nombre, formData.apellidos].filter(Boolean).join(" ");
  const fechaPalabras = fechaEnPalabras(formData.fechaNacimiento);
  const documento = [DOC_LABELS[formData.tipoDocumento], formData.numeroDocumento].filter(Boolean).join(" ");
  const anios = edad(formData.fechaNacimiento);
  const avisoTutor =
    formData.esTutor && anios >= 18 ? `${formData.nombre} tendría ${anios} años. ¿Es su fecha, no la tuya?` : null;
  const sampleAlt =
    `Muestra del pasaporte DEA de ${nombreCompleto}. Fecha de nacimiento: ${fechaPalabras}. ` +
    `Documento: ${documento}. País: ${formData.paisResidencia}.`;

  const totalArchivos = (files.diagnostico.length || 0) + (files.documento.length || 0);
  const archivosNota =
    editing && formData.archivoBlob
      ? isPdfDocuments(formData.archivoBlob) && docMode === "agregar"
        ? " · se añadirán al final de tus documentos actuales"
        : " · sustituirán a tus documentos actuales"
      : "";

  return (
    <div className="review">
      <p className="step-intro">
        {editing
          ? "Revisa que todo esté bien antes de guardar los cambios."
          : "Revisa que todo esté bien. Después pulsa «Todo está bien. Enviar»."}
      </p>

      {sample.status !== "error" && (
        <section className="muestra" aria-labelledby="muestra-title">
          <h2 id="muestra-title" className="muestra-title">
            Así saldrá en tu pasaporte <span className="muestra-tag">Muestra</span>
          </h2>
          <p className="muestra-sub">
            Es el pasaporte de {formData.nombre}, con sus datos. El número y el QR llegan cuando se apruebe.
          </p>
          {sample.status === "ready" ? (
            <img className="muestra-img" src={sample.url} alt={sampleAlt} onError={onSampleError} />
          ) : (
            <div className="sk muestra-img" data-testid="muestra-skeleton">
              <span className="sk-sr" role="status">
                Preparando la muestra de tu pasaporte…
              </span>
            </div>
          )}
        </section>
      )}

      <ol className="review-checks" aria-label="Comprueba estos 3 datos">
        <Check
          id="nombre"
          title="Nombre y apellidos"
          value={nombreCompleto}
          hint="Igual que en su DNI, letra a letra y con tildes"
          onFix={() => jumpToStep("datos")}
        />
        <Check
          id="fecha"
          title="Fecha de nacimiento"
          value={fechaPalabras}
          hint="Día, mes y año"
          aviso={avisoTutor}
          onFix={() => jumpToStep("datos")}
        />
        <Check
          id="documento"
          title="Documento"
          value={documento}
          hint="Mira el número en su documento, cifra a cifra"
          onFix={() => jumpToStep("residencia")}
        />
      </ol>

      <div className="form-banner info" role="note">
        <BsInfoCircle aria-hidden="true" />
        <span>Revisa ahora: después de aprobarlo, cambiar estos datos necesita otra revisión.</span>
      </div>

      <section className="review-card">
        <div className="review-card-head">
          <h2>Datos personales</h2>
          <EditButton step="datos" />
        </div>
        <dl>
          {formData.esTutor && (
            <Row
              label="Tutor/a"
              value={[formData.tutorNombre, formData.tutorApellidos].filter(Boolean).join(" ")}
            />
          )}
          <Row label="Nombre" value={nombreCompleto} />
          <Row label="Fecha de nacimiento" value={fechaCorta(formData.fechaNacimiento)} />
        </dl>
      </section>

      <section className="review-card">
        <div className="review-card-head">
          <h2>Residencia y documento</h2>
          <EditButton step="residencia" />
        </div>
        <dl>
          <Row label="País" value={formData.paisResidencia} />
          <Row label="Localidad" value={formData.localidadResidencia} />
          <Row label="Lugar de nacimiento" value={formData.lugarNacimiento} />
          <Row
            label="Documento"
            value={[DOC_LABELS[formData.tipoDocumento], formData.numeroDocumento].filter(Boolean).join(" · ")}
          />
          <Row label="Teléfono" value={formData.numeroTelefono} />
          <Row label="Correo" value={formData.correoElectronico} />
        </dl>
      </section>

      <section className="review-card">
        <div className="review-card-head">
          <h2>Diagnóstico</h2>
          <EditButton step="diagnostico" />
        </div>
        {seleccionados.length ? (
          <ul className="review-tags">
            {seleccionados.map((k) => (
              <li key={k}>{DIAG_LABELS[k]}</li>
            ))}
          </ul>
        ) : (
          <p className="review-missing">Sin completar</p>
        )}
      </section>

      <section className="review-card">
        <div className="review-card-head">
          <h2>Documentos</h2>
          <EditButton step="documentos" />
        </div>
        <p>
          {totalArchivos > 0
            ? `${totalArchivos} archivo${totalArchivos > 1 ? "s" : ""} adjunto${totalArchivos > 1 ? "s" : ""}${archivosNota}`
            : editing
            ? "Se conservan los documentos ya subidos"
            : "Sin documentos"}
        </p>
      </section>

      {error && (
        <div className="form-banner error" role="alert">
          <BsExclamationCircle aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!editing && (
        <div className="form-banner info" role="note">
          <BsInfoCircle aria-hidden="true" />
          <span>
            <strong>Tu solicitud aún no está enviada.</strong> Solo la recibimos cuando pulsas «Todo está bien. Enviar».
            Si sales ahora, se queda guardada sin enviar.
          </span>
        </div>
      )}

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={() => onBack()}>
          <BsArrowLeft aria-hidden="true" /> Atrás
        </button>
        <button type="button" className="btn-primary btn-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? "Enviando…" : editing ? "Guardar cambios" : "Todo está bien. Enviar"} <BsCheckCircle aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default PasoRevision;
