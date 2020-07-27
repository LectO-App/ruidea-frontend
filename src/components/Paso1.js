import React, { useState, useEffect } from "react";

const Paso1 = (props) => {
  const { siguientePaso, handleFormChange, formData } = props;
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

  return (
    <form>
      <label htmlFor="nombre">Nombre</label>
      <input
        type="text"
        name="nombre"
        id="nombre"
        value={valores.nombre}
        onChange={inputChange("nombre")}
      />
      <label htmlFor="apellidos">Apellidos</label>
      <input
        type="text"
        name="apellidos"
        id="apellidos"
        value={valores.apellidos}
        onChange={inputChange("apellidos")}
      />
      <label htmlFor="lugar-residencia">Lugar de residencia</label>
      <select name="lugar-residencia" id="lugar-residencia">
        <option value="Argentina">Argentina</option>
      </select>
      <label htmlFor="localidad">Localidad</label>
      <input
        type="text"
        name="localidad"
        id="localidad"
        value={valores.localidad}
        onChange={inputChange("localidad")}
      />

      <button onClick={irAlSiguientePaso}>Siguiente</button>
    </form>
  );
};

export default Paso1;
