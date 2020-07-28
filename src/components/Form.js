/*eslint-disable*/
import React, { useState } from "react";

import Paso1 from "./Paso1";
import Paso2 from "./Paso2";
import Paso3 from "./Paso3";
import Paso4 from "./Paso4";
import Paso5 from "./Paso5";

const Form = () => {
  const [paso, setPaso] = useState(1);
  const [formData, setFormData] = useState({});

  const siguientePaso = () => {
    setPaso(paso + 1);
  };

  const pasoAnterior = () => {
    setPaso(paso - 1);
  };

  const handleFormChange = (newFormData) => {
    setFormData({
      ...formData,
      ...newFormData,
    });
  };

  const showCurrentStep = () => {
    switch (paso) {
      case 1:
        return (
          <Paso1
            siguientePaso={siguientePaso}
            handleFormChange={handleFormChange}
            formData={formData}
          />
        );
      case 2:
        return (
          <Paso2
            siguientePaso={siguientePaso}
            pasoAnterior={pasoAnterior}
            handleFormChange={handleFormChange}
            formData={formData}
          />
        );
      case 3:
        return (
          <Paso3
            siguientePaso={siguientePaso}
            pasoAnterior={pasoAnterior}
            handleFormChange={handleFormChange}
            formData={formData}
          />
        );
      case 4:
        return (
          <Paso4
            siguientePaso={siguientePaso}
            pasoAnterior={pasoAnterior}
            handleFormChange={handleFormChange}
            formData={formData}
          />
        );
      case 5:
        return <Paso5 pasoAnterior={pasoAnterior} formData={formData} />;
    }
  };

  return (
    <div className="container-form">
      <div className="container-barra">
        <div className="barra-lateral">
          <div className={`barra-verde barra-verde-${paso}`}></div>
          <div className="puntos">
            <div className="punto" data-selected={paso >= 1 && "true"}></div>
            <div className="punto" data-selected={paso >= 2 && "true"}></div>
            <div className="punto" data-selected={paso >= 3 && "true"}></div>
            <div className="punto" data-selected={paso >= 4 && "true"}></div>
            <div className="punto" data-selected={paso >= 5 && "true"}></div>
          </div>
        </div>
      </div>

      <div className="container-inscripcion">
        <h1 className="titulo">Inscribirse</h1>
        {showCurrentStep()}
      </div>
    </div>
  );
};

export default Form;
