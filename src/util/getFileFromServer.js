import { axiosInstance } from '../axios';

export const getFileFromServer = async (type, id) => {
	const isPdf = type === 'pdf';
	const res = await axiosInstance.get(`/usuario/descargar/${type}/${id}`, {
		responseType: 'arraybuffer',
		headers: {
			Accept: isPdf ? 'application/pdf' : 'image/jpeg',
		},
	});
	const blob = new Blob([res.data], {
		type: isPdf ? 'application/pdf' : 'image/jpeg',
	});
	const link = document.createElement('a');
	link.href = window.URL.createObjectURL(blob);
	link.download = isPdf ? `Certificado Ruidea.pdf` : 'Certificado Ruidea.jpeg';
	link.click();
};
