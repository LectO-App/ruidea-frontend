import { passportUrl, paddedPassportNumber } from './passport';

// A copy of the holder's passport on this device, so /mostrar works with no connection.
// It holds only what the card shows: never the ID document number, birth date, diagnosis,
// email or CSRF token. The QR is the live share link, so a stale copy cannot fake validity.
const KEY = 'ruidea-pasaporte';
// Set by "Quitar de este móvil": no copy is saved again until the next sign-in.
const REMOVED_KEY = 'ruidea-pasaporte-quitado';

const storage = () => {
	try {
		return window.localStorage;
	} catch (e) {
		return null;
	}
};

export const isApprovedHolder = usuario => !!usuario && usuario.emailVerificado === true && usuario.estado === 'aceptado';

// Axios gives a response for every HTTP error; no response means the request never got an answer.
export const isNetworkError = err => !!err && !err.response;

export const loadOfflinePassport = () => {
	const store = storage();
	if (!store) return null;
	try {
		const copy = JSON.parse(store.getItem(KEY));
		if (!copy || typeof copy.url !== 'string' || typeof copy.numeroPasaporte !== 'string') return null;
		return copy;
	} catch (e) {
		return null;
	}
};

export const clearOfflinePassport = () => {
	const store = storage();
	if (store) store.removeItem(KEY);
};

export const removeOfflinePassport = () => {
	clearOfflinePassport();
	const store = storage();
	if (store) store.setItem(REMOVED_KEY, '1');
};

export const allowOfflinePassport = () => {
	const store = storage();
	if (store) store.removeItem(REMOVED_KEY);
};

export const offlinePassportRemoved = () => {
	const store = storage();
	return !!store && store.getItem(REMOVED_KEY) === '1';
};

// Called with every successful GET /usuario/me: refreshes the copy for an approved holder
// and deletes it for anyone else. A holder without a share token gets no copy, because the
// legacy link carries the ID document number.
export const syncOfflinePassport = (usuario, now = new Date()) => {
	const store = storage();
	if (!store) return;
	if (!isApprovedHolder(usuario) || !usuario.shareToken) {
		clearOfflinePassport();
		return;
	}
	if (offlinePassportRemoved()) return;
	const copy = {
		nombre: usuario.nombre || '',
		apellidos: usuario.apellidos || '',
		numeroPasaporte: paddedPassportNumber(usuario.numeroPasaporte),
		url: passportUrl(usuario),
		guardadoEn: now.toISOString(),
	};
	try {
		store.setItem(KEY, JSON.stringify(copy));
	} catch (e) {
		// Storage full or blocked (private mode): the page still works online.
	}
};

export const formatSavedAt = iso =>
	new Intl.DateTimeFormat('es-ES', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(iso));
