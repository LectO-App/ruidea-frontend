import React, { useState, useEffect } from "react";

const Paso2 = (props) => {
  const { siguientePaso, handleFormChange, formData, pasoAnterior } = props;
  const [valores, setValores] = useState({});

  useEffect(() => {
    setValores(formData);
  }, []);

  const inputChange = (input) => (e) => {
    setValores({
      ...valores,
      [input]: e.target.value,
    });
  };

  const irAlSiguientePaso = (e) => {
    console.log(valores);
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
      <label htmlFor="numero-documento">Numero de documento</label>
      <input
        type="text"
        name="numero-documento"
        id="numero-documento"
        value={valores.numeroDocumento}
        onChange={inputChange("numeroDocumento")}
      />
      <label htmlFor="fecha-nacimiento">Fecha de nacimiento</label>
      <input
        type="date"
        name="fecha-nacimiento"
        id="fecha-nacimiento"
        value={valores.fechaNacimiento}
        onChange={inputChange("fechaNacimiento")}
      />
      <label htmlFor="lugar-nacimiento">Lugar de nacimiento</label>
      <input
        type="text"
        name="lugar-nacimiento"
        id="lugar-nacimiento"
        value={valores.lugarNacimiento}
        onChange={inputChange("lugarNacimiento")}
      />
      <label htmlFor="correo-electronico">Correo electrónico</label>
      <input
        type="text"
        name="correo-electronico"
        id="correo-electronico"
        value={valores.correoElectronico}
        onChange={inputChange("correoElectronico")}
      />

      <label htmlFor="correo-electronico">Verificar correo electrónico</label>
      <input
        type="text"
        name="verificar-correo-electronico"
        id="verificar-correo-electronico"
        value={valores.verificarCorreoElectronico}
        onChange={inputChange("verificarCorreoElectronico")}
      />
      <label htmlFor="telefono">Numero de teléfono móvil</label>
      <input
        type="text"
        name="telefono"
        id="telefono"
        value={valores.telefono}
        onChange={inputChange("telefono")}
      />

      <button onClick={irAlPasoAnterior}>Anterior</button>
      <button onClick={irAlSiguientePaso}>Siguiente</button>
    </form>
  );
};

export default Paso2;
