import React from 'react';
import PasaporteValido from './PasaporteValido';

// Fictitious sample shown from the landing page; same component as a real passport page.
const EJEMPLO = {
	nombre: 'Hugo',
	apellidos: 'Salas Ocaña',
	paisResidencia: 'España',
	fechaNacimiento: '2017-04-12T00:00:00.000Z',
	documentoFinal: '427Z',
	numeroPasaporte: 123456,
	diagnostico: { dislexia: true },
};

const VerificarEjemplo = () => <PasaporteValido pasaporte={EJEMPLO} ejemplo />;

export default VerificarEjemplo;
