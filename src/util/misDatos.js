import { axiosInstance } from '../axios';

// The ZIP from GET /usuario/me/export: a readable PDF, datos.json and the uploaded documents.
export const downloadMisDatos = async () => {
	const res = await axiosInstance.get('/usuario/me/export', { responseType: 'blob' });
	const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/zip' }));
	const link = document.createElement('a');
	link.href = url;
	link.download = 'mis-datos-ruidea.zip';
	link.click();
	setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

// 'YYYY-MM-DD' (UTC) -> '20 de noviembre'.
export const diaLargo = dia =>
	new Date(`${dia}T00:00:00Z`).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' });

export const aperturasTexto = ({ veces, dias }) => {
	if (!veces) return 'Nadie lo abrió en los últimos 30 días.';
	const lista = dias.map(diaLargo).join(', ');
	return `Lo abrieron ${veces} ${veces === 1 ? 'vez' : 'veces'} en los últimos 30 días: ${lista}.`;
};
