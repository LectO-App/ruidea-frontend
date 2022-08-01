const capitalDiagnostics = {
	tdah: 'TDA-H',
	dispraxia: 'Dispraxia',
	dislexia: 'Dislexia',
	discalculia: 'Discalculia',
	disortografía: 'Disortografía',
};
export const capitalizedDiagnostic = str => {
	return capitalDiagnostics[str] || str;
};
