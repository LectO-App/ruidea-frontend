import React, { useEffect, useState } from "react";
import upload from "../img/upload.png";

const Paso4 = (props) => {
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
    <form className="fileform">
      
      <div className="filePicker">
        <img src={upload} alt=""></img>
        <input type="file" name="diagnostico" id="diagnostico"></input>
        <label for="diagnostico"> 
        Adjuntar diagnostico</label>
        
      </div>
      <div className="filePicker">
      <img src={upload} alt=""></img>
        <input type="file" name="dniPasaporte" id="dniPasaporte" />
        <label for="dniPasaporte">Adjuntar DNI o Pasaporte</label>
      </div>
      
      <input type="radio" name="acepto-recibir-info" id="acepto-recibir-info" />
      <label htmlFor="acepto-recibir-info">
        Acepto recibir información actualizada sobre dislexia y otras DEAs.
      </label>
      <input type="radio" name="acepto-solicitud" id="acepto-solicitud" />
      <label htmlFor="acepto-solicitud">
        Acepto la solicitud del pasaporte DEA y la política de protección de
        datos.
      </label>
      <button onClick={irAlPasoAnterior}>Anterior</button>
      <button onClick={irAlSiguientePaso}>Enviar</button>
    </form>
  );
};

export default Paso4;
