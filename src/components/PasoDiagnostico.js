import React, { useState } from "react";
import { BsArrowRight, BsArrowLeft } from "react-icons/bs";

import DiagnosisCards from "./form/DiagnosisCards";

const seed = (d) => ({
  dislexia: !!(d && d.dislexia),
  discalculia: !!(d && d.discalculia),
  disortografía: !!(d && d.disortografía),
  dispraxia: !!(d && d.dispraxia),
  tdah: !!(d && d.tdah),
});

const PasoDiagnostico = (props) => {
  const { formData, onNext, onBack } = props;
  const [diag, setDiag] = useState(() => seed(formData.diagnostico));
  const [error, setError] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (!Object.values(diag).some(Boolean)) {
      setError("Por favor, elige al menos un tipo de diagnóstico.");
      return;
    }
    setError(null);
    onNext({ diagnostico: diag });
  };

  const back = () => onBack({ diagnostico: diag });

  return (
    <form className="step-form" onSubmit={submit} noValidate>
      <DiagnosisCards
        value={diag}
        onChange={(next) => {
          setDiag(next);
          if (error) setError(null);
        }}
        error={error}
      />

      <div className="step-actions">
        <button type="button" className="btn-secondary" onClick={back}>
          <BsArrowLeft aria-hidden="true" /> Atrás
        </button>
        <button type="submit" className="btn-primary">
          Continuar <BsArrowRight aria-hidden="true" />
        </button>
      </div>
    </form>
  );
};

export default PasoDiagnostico;
