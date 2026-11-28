const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const dos = n => String(n).padStart(2, '0');

// A birth date as stored (midnight UTC), read in UTC so no time zone shifts the day: "12 de abril de 2017".
export const fechaLarga = value => {
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return '';
	return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()]} de ${d.getUTCFullYear()}`;
};

// The device's local time, to the second: "sábado 28 nov 2026, 14:03:09".
export const horaComprobacion = d =>
	`${DIAS[d.getDay()]} ${d.getDate()} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}, ` +
	`${dos(d.getHours())}:${dos(d.getMinutes())}:${dos(d.getSeconds())}`;
