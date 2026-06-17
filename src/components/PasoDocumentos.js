import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { BsArrowRight, BsArrowLeft, BsShieldLock } from "react-icons/bs";

import DocumentUploader from "./form/DocumentUploader";

// Step — the documents (the whole point of the passport, §5) and consent (§6). Upload is
// framed and reassured, accepts a photo or a PDF, and consents are unbundled: marketing is
// separate and optional; the data-processing consent is explicit and required.
const PasoDocumentos = (props) => {
  const { formData, files, setFiles, onNext, onBack, editing } = props;
  const { register, handleSubmit, errors, getValues } = useForm();
  const [filesError, setFilesError] = useState(null);

  const setGroup = (group) => (newFiles) =>
    setFiles((prev) => ({ ...prev, [group]: newFiles }));

  const submit = (data) => {
    // The diagnosis report is what the medical reviewer assesses — require it for new
    // applications (when editing, the documents were already uploaded previously).
    if (!editing && files.diagnostico.length === 0) {
      setFilesError("Adjunta tu informe de diagnóstico para que el equipo médico pueda revisarlo.");
      return;
    }
    setFilesError(null);
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
        <BsShieldLock aria-hidden="true" /> Tus documentos viajan cifrados y solo los ve el equipo médico que
        revisa tu solicitud.
      </p>

      <DocumentUploader
        id="diagnostico"
        label="Informe de diagnóstico"
        hint="Sube el informe firmado por el profesional. Puede ser un PDF o una foto del documento en papel."
        files={files.diagnostico}
        onFilesChange={setGroup("diagnostico")}
      />

      <DocumentUploader
        id="documento"
        label="DNI, NIE o pasaporte"
        hint="Una foto o un PDF, por ambas caras si aplica."
        files={files.documento}
        onFilesChange={setGroup("documento")}
      />

      {filesError && (
        <span className="error-message" role="alert">
          {filesError}
        </span>
      )}

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
            Doy mi consentimiento para que se traten mis datos de salud con el fin de emitir el pasaporte DEA, según la{" "}
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

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={back}>
          <BsArrowLeft aria-hidden="true" /> Atrás
        </button>
        <button type="submit" className="btn-primary">
          Revisar <BsArrowRight aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default PasoDocumentos;
