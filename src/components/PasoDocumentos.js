import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { BsArrowRight, BsArrowLeft, BsShieldLock } from "react-icons/bs";

import DocumentUploader from "./form/DocumentUploader";
import SingleStepActions from "./form/SingleStepActions";
import { isPdfDocuments, sizeProblem, MAX_FILES } from "../util/documents";

// Step — the documents (the whole point of the passport, §5) and consent (§6). Upload is
// framed and reassured, accepts a photo or a PDF, and consents are unbundled: marketing is
// separate and optional; the data-processing consent is explicit and required.
// The server joins every file into one PDF. When editing, the person chooses whether the
// new files go after the PDF sent before or replace it; an older ZIP can only be replaced.
const PasoDocumentos = (props) => {
  const { formData, files, setFiles, onNext, onBack, editing, docMode, setDocMode, documentsError } = props;
  const { singleStep, busy, sendsToo, campos } = props;
  const { register, handleSubmit, errors, getValues } = useForm();
  const [filesError, setFilesError] = useState(documentsError || null);

  const setGroup = (group) => (next) =>
    setFiles((prev) => ({ ...prev, [group]: typeof next === "function" ? next(prev[group]) : next }));

  const totalFiles = files.diagnostico.length + files.documento.length;
  const hasCurrentDocs = editing && Boolean(formData.archivoBlob);
  const canAdd = hasCurrentDocs && isPdfDocuments(formData.archivoBlob);
  // A step opened for one reason shows only its uploader (campos); null shows both. Both
  // documents live in one PDF, so replacing it needs both uploaders again.
  const onlyCampos = campos && (!hasCurrentDocs || (canAdd && docMode === "agregar"));
  const showInforme = !onlyCampos || campos.has("informe");
  const showIdentidad = !onlyCampos || campos.has("identidad");

  const submit = (data) => {
    // The diagnosis report is what the medical reviewer assesses — require it for new
    // applications (when editing, the documents were already uploaded previously).
    if (!editing && files.diagnostico.length === 0) {
      setFilesError("Adjunta tu informe de diagnóstico para que el equipo médico pueda revisarlo.");
      return;
    }
    // Opened on its own to replace a document: there must be something new to upload.
    if (singleStep && totalFiles === 0) {
      setFilesError("Adjunta un archivo nuevo.");
      return;
    }
    if (totalFiles > MAX_FILES) {
      setFilesError(`Puedes subir hasta ${MAX_FILES} archivos en total. Quita alguno o junta varios en un PDF.`);
      return;
    }
    const tooLarge = sizeProblem([...files.diagnostico, ...files.documento]);
    if (tooLarge) {
      setFilesError(tooLarge);
      return;
    }
    setFilesError(null);
    // Opened on its own, the step only replaces files: the stored consents go back unchanged.
    if (singleStep) {
      onNext({ aceptoRecibirInfo: !!formData.aceptoRecibirInfo, aceptoSolicitud: !!formData.aceptoSolicitud });
      return;
    }
    onNext({
      aceptoRecibirInfo: !!data.aceptoRecibirInfo,
      aceptoSolicitud: !!data.aceptoSolicitud,
    });
  };

  const back = () =>
    onBack({
      aceptoRecibirInfo: !!getValues("aceptoRecibirInfo"),
      aceptoSolicitud: !!getValues("aceptoSolicitud"),
    });

  return (
    <form className="step-form" onSubmit={handleSubmit(submit)} noValidate>
      <p className="privacy-note">
        <BsShieldLock aria-hidden="true" />{" "}
        {singleStep
          ? "Solo lo ve el equipo médico."
          : "Tus documentos viajan cifrados y solo los ve el equipo médico que revisa tu solicitud."}
      </p>

      {!singleStep && (
        <p className="step-intro">
          Si puedes, sube un solo PDF con todo. Si tienes varias fotos o archivos, súbelos todos: en RUIDEA los
          juntamos en un único PDF, en el orden que elijas.
        </p>
      )}

      {showInforme && (
        <DocumentUploader
          id="diagnostico"
          label="Informe de diagnóstico"
          hint={
            singleStep
              ? "Firmado por el profesional."
              : "Sube el informe firmado por el profesional. Puede ser un PDF o una foto del documento en papel."
          }
          files={files.diagnostico}
          onFilesChange={setGroup("diagnostico")}
        />
      )}

      {showIdentidad && (
        <DocumentUploader
          id="documento"
          label="DNI, NIE o pasaporte"
          hint={singleStep ? undefined : "Una foto o un PDF, por ambas caras si aplica."}
          files={files.documento}
          onFilesChange={setGroup("documento")}
        />
      )}

      {hasCurrentDocs && totalFiles > 0 && canAdd && (
        <fieldset className="choice doc-mode">
          <legend>¿Qué hacemos con los documentos que ya nos enviaste?</legend>
          <div className="choice-options">
            <label className={`choice-card${docMode === "agregar" ? " selected" : ""}`}>
              <input
                type="radio"
                name="modoDocumentos"
                checked={docMode === "agregar"}
                onChange={() => setDocMode("agregar")}
              />
              <span>Guardarlos y añadir los nuevos al final</span>
            </label>
            <label className={`choice-card${docMode === "reemplazar" ? " selected" : ""}`}>
              <input
                type="radio"
                name="modoDocumentos"
                checked={docMode === "reemplazar"}
                onChange={() => setDocMode("reemplazar")}
              />
              <span>Cambiarlos por los nuevos</span>
            </label>
          </div>
        </fieldset>
      )}
      {hasCurrentDocs && totalFiles > 0 && !canAdd && (
        <p className="field-hint">
          Los archivos nuevos sustituirán a los documentos que nos enviaste antes. Sube todo lo necesario: el informe
          y tu documento de identidad.
        </p>
      )}

      {filesError && (
        <span className="error-message" role="alert">
          {filesError}
        </span>
      )}

      {!singleStep && (
        <div className="consents">
          <label className="consent-row">
            <input
              type="checkbox"
              name="aceptoRecibirInfo"
              id="aceptoRecibirInfo"
              defaultChecked={formData.aceptoRecibirInfo || false}
              ref={register()}
            />
            <span>Quiero recibir información sobre dislexia y otras DEA. (Opcional)</span>
          </label>

          <label className="consent-row required">
            <input
              type="checkbox"
              name="aceptoSolicitud"
              id="aceptoSolicitud"
              defaultChecked={formData.aceptoSolicitud || false}
              ref={register({ required: "Necesitamos tu consentimiento para continuar" })}
            />
            <span>
              Doy mi consentimiento para que se traten mis datos de salud con el fin de emitir el pasaporte DEA, según
              la{" "}
              <Link to="/politica-privacidad" target="_blank">
                política de protección de datos
              </Link>
              .
            </span>
          </label>
          {errors.aceptoSolicitud && (
            <span className="error-message" role="alert">
              {errors.aceptoSolicitud.message}
            </span>
          )}
        </div>
      )}

      {singleStep ? (
        <SingleStepActions busy={busy} sendsToo={sendsToo} />
      ) : (
        <div className="step-actions">
          <button type="button" className="btn-secondary" onClick={back}>
            <BsArrowLeft aria-hidden="true" /> Atrás
          </button>
          <button type="submit" className="btn-primary">
            Revisar <BsArrowRight aria-hidden="true" />
          </button>
        </div>
      )}
    </form>
  );
};

export default PasoDocumentos;
