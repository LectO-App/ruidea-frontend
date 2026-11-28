// The five DEAs, keyed as the API's `diagnostico` object. One source for the landing's
// "¿Para quién es?" cards and the public verification page.
export const DEAS = [
	{ key: 'dislexia', name: 'Dislexia', text: 'Dificultad en la lectura y la decodificación de palabras.' },
	{ key: 'discalculia', name: 'Discalculia', text: 'Dificultad para comprender y operar con números.' },
	{ key: 'disortografía', name: 'Disortografía', text: 'Dificultad en la escritura correcta de las palabras.' },
	{ key: 'dispraxia', name: 'Dispraxia', text: 'Dificultad en la coordinación y planificación de movimientos.' },
	{ key: 'tdah', name: 'TDA-H', text: 'Dificultades de atención, impulsividad y/o hiperactividad.' },
];

export const deasOf = (diagnostico = {}) => DEAS.filter(dea => diagnostico[dea.key]);
