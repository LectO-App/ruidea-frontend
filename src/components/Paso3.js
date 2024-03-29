/* eslint-disable */

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

const Paso3 = (props) => {
  const { siguientePaso, handleFormChange, formData, pasoAnterior } = props;
  const { register, handleSubmit, errors, getValues } = useForm();

  const [checked, setChecked] = useState(0);

  useEffect(() => {
    if (formData.diagnostico) {
      let count = 0;
      Object.entries(formData.diagnostico).forEach((item) => {
        item[1] && count++;
      });
      setChecked(count);
    }
  }, []);

  const irAlSiguientePaso = (data) => {
    handleFormChange({ diagnostico: data });
    siguientePaso();
  };

  const irAlPasoAnterior = (e) => {
    e.preventDefault();
    pasoAnterior(getValues());
  };

  const handleCheck = (e) => {
    if (e.target.checked) {
      setChecked(checked + 1);
    } else {
      setChecked(checked - 1);
    }
  };

  return (
    <form className="checkform" onSubmit={handleSubmit(irAlSiguientePaso)}>
      <h3>Tipo de diagnostico</h3>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          name="dislexia"
          id="dislexia"
          defaultChecked={
            formData.diagnostico ? formData.diagnostico.dislexia : false
          }
          ref={register({
            validate: () =>
              checked > 0 ||
              "Por favor seleccione al menos un tipo de diagnóstico.",
          })}
          onChange={handleCheck}
        />
        <label htmlFor="dislexia">Dislexia</label>
      </div>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          name="discalculia"
          id="discalculia"
          defaultChecked={
            formData.diagnostico ? formData.diagnostico.discalculia : false
          }
          ref={register}
          onChange={handleCheck}
        />
        <label htmlFor="discalculia">Discalculia</label>
      </div>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          name="disortografía"
          id="disortografía"
          defaultChecked={
            formData.diagnostico ? formData.diagnostico.disortografía : false
          }
          ref={register}
          onChange={handleCheck}
        />
        <label htmlFor="disortografía">Disortografía</label>
      </div>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          name="dispraxia"
          id="dispraxia"
          defaultChecked={
            formData.diagnostico ? formData.diagnostico.dispraxia : false
          }
          ref={register}
          onChange={handleCheck}
        />
        <label htmlFor="dispraxia">Dispraxia</label>
      </div>
      <div className="checkbox-wrapper">
        <input
          type="checkbox"
          name="tdah"
          id="tdah"
          defaultChecked={
            formData.diagnostico ? formData.diagnostico.tdah : false
          }
          ref={register}
          onChange={handleCheck}
        />
        <label htmlFor="tdah">TDA-H</label>
      </div>
      {errors.dislexia && (
        <h4 className="error-message">{errors.dislexia.message}</h4>
      )}
      <div className="botones">
        <button type="submit" className="btn-siguiente">
          Siguiente
        </button>
        <button onClick={irAlPasoAnterior} className="btn-anterior">
          Anterior
        </button>
      </div>
    </form>
  );
};

export default Paso3;
