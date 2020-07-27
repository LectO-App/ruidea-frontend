/*eslint-disable*/
import React, { useState } from "react";

import Paso1 from "./Paso1";
import Paso2 from "./Paso2";
import Paso3 from "./Paso3";
import Paso4 from "./Paso4";

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
    setFormData(newFormData);
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
    }
  };

  return (
    <div>
      <h1 className="titulo">Inscribirse</h1>
      <div className="barra-latera"></div>
      {showCurrentStep()}
    </div>
  );
};

export default Form;
