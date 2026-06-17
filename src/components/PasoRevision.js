import React, { useState } from "react";
import { BsArrowLeft, BsPencil, BsCheckCircle, BsExclamationCircle } from "react-icons/bs";

const DIAG_LABELS = {
  dislexia: "Dislexia",
  discalculia: "Discalculia",
  disortografía: "Disortografía",
  dispraxia: "Dispraxia",
  tdah: "TDA-H",
};

const Row = ({ label, value }) => (
  <div className="review-row">
    <dt>{label}</dt>
    <dd>{value || <span className="review-missing">Sin completar</span>}</dd>
  </div>
);

// Final review (§1) — a calm summary with per-section "Editar" so people can check their
// work without re-navigating the whole flow, then one clear primary action.
const PasoRevision = (props) => {
  const { formData, files, editing, onBack, onSubmit, jumpToStep } = props;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const totalArchivos = (files.diagnostico.length || 0) + (files.documento.length || 0);

  return (
    <div className="review">
      <p className="step-intro">Revisa que todo esté bien antes de enviar tu solicitud.</p>

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
          <Row label="Nombre" value={[formData.nombre, formData.apellidos].filter(Boolean).join(" ")} />
          <Row
            label="Fecha de nacimiento"
            value={formData.fechaNacimiento ? String(formData.fechaNacimiento).substring(0, 10) : ""}
          />
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
            value={[formData.tipoDocumento && formData.tipoDocumento.toUpperCase(), formData.numeroDocumento]
              .filter(Boolean)
              .join(" · ")}
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
            ? `${totalArchivos} archivo${totalArchivos > 1 ? "s" : ""} adjunto${totalArchivos > 1 ? "s" : ""}`
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

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={() => onBack()}>
          <BsArrowLeft aria-hidden="true" /> Atrás
        </button>
        <button type="button" className="btn-primary btn-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? "Enviando…" : "Enviar solicitud"} <BsCheckCircle aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

export default PasoRevision;
