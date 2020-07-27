import React, { useState, useEffect } from "react";

const Paso3 = (props) => {
  const { siguientePaso, handleFormChange, formData, pasoAnterior } = props;
  const [valores, setValores] = useState({});

  useEffect(() => {
    setValores(formData);
  }, []);

  const inputChange = (input) => (e) => {
    setValores({
      [input]: e.target.value,
    });
  };

  const irAlSiguientePaso = (e) => {
    e.preventDefault();
    handleFormChange(valores);
    siguientePaso();
  };

  const irAlPasoAnterior = (e) => {
    e.preventDefault();
    pasoAnterior();
  };
  return (
    <form>
      <input
        type="checkbox"
        name="dislexia"
        id="dislexia"
        value={valores.dislexia}
        onChange={inputChange("dislexia")}
      />
      <label htmlFor="dislexia">Dislexia</label>
      <input
        type="checkbox"
        name="discalculia"
        id="discalculia"
        value={valores.discalculia}
        onChange={inputChange("discalculia")}
      />
      <label htmlFor="discalculia">Discalculia</label>
      <input
        type="checkbox"
        name="disortografia"
        id="disortografia"
        value={valores.disortografia}
        onChange={inputChange("disortografia")}
      />
      <label htmlFor="disortografia">Disortografía</label>
      <input
        type="checkbox"
        name="dispraxia"
        id="dispraxia"
        value={valores.dispraxia}
        onChange={inputChange("dispraxia")}
      />
      <label htmlFor="dispraxia">Dispraxia</label>
      <input
        type="checkbox"
        name="tda-h"
        id="tda-h"
        value={valores.tdaH}
        onChange={inputChange("tdaH")}
      />
      <label htmlFor="tda-h">TDA-H</label>

      <button onClick={irAlPasoAnterior}>Anterior</button>
      <button onClick={irAlSiguientePaso}>Siguiente</button>
    </form>
  );
};

export default Paso3;
