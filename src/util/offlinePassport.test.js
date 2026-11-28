import {
	syncOfflinePassport,
	loadOfflinePassport,
	clearOfflinePassport,
	removeOfflinePassport,
	allowOfflinePassport,
	isNetworkError,
	formatSavedAt,
} from './offlinePassport';

// Synthetic values only.
const approved = {
	_id: 'u1',
	nombre: 'Ana',
	apellidos: 'Prueba Ejemplo',
	emailVerificado: true,
	estado: 'aceptado',
	numeroPasaporte: 1042,
	numeroDocumento: 'SINT-0001-X',
	fechaNacimiento: '2010-03-04T00:00:00.000Z',
	correoElectronico: 'ana@example.test',
	diagnostico: { dislexia: true },
	shareToken: 'token-de-prueba',
	csrfToken: 'csrf-de-prueba',
};

afterEach(() => window.localStorage.clear());

test('an approved holder gets a copy with only the card fields', () => {
	syncOfflinePassport(approved, new Date('2026-11-20T09:30:00Z'));
	expect(loadOfflinePassport()).toEqual({
		nombre: 'Ana',
		apellidos: 'Prueba Ejemplo',
		numeroPasaporte: '0001042',
		url: `${window.location.origin}/verificar/token-de-prueba`,
		guardadoEn: '2026-11-20T09:30:00.000Z',
	});
	const raw = Object.values(window.localStorage).join(' ');
	for (const secret of ['SINT-0001-X', '2010', 'dislexia', 'ana@example.test', 'csrf-de-prueba']) {
		expect(raw).not.toContain(secret);
	}
});

test('a later load refreshes the copy', () => {
	syncOfflinePassport(approved, new Date('2026-11-20T09:30:00Z'));
	syncOfflinePassport({ ...approved, nombre: 'Ana María' }, new Date('2026-11-21T09:30:00Z'));
	expect(loadOfflinePassport()).toMatchObject({ nombre: 'Ana María', guardadoEn: '2026-11-21T09:30:00.000Z' });
});

test.each([
	['no longer approved', { ...approved, estado: 'revision' }],
	['email not verified', { ...approved, emailVerificado: false }],
	['no share token', { ...approved, shareToken: undefined }],
])('the copy is deleted when the holder is %s', (_, usuario) => {
	syncOfflinePassport(approved);
	syncOfflinePassport(usuario);
	expect(loadOfflinePassport()).toBeNull();
});

test('Quitar de este móvil keeps the copy away until the next sign-in', () => {
	syncOfflinePassport(approved);
	removeOfflinePassport();
	expect(loadOfflinePassport()).toBeNull();
	syncOfflinePassport(approved);
	expect(loadOfflinePassport()).toBeNull();

	allowOfflinePassport();
	syncOfflinePassport(approved);
	expect(loadOfflinePassport()).not.toBeNull();
	clearOfflinePassport();
	expect(loadOfflinePassport()).toBeNull();
});

test('a broken copy reads as no copy', () => {
	window.localStorage.setItem('ruidea-pasaporte', '{not json');
	expect(loadOfflinePassport()).toBeNull();
});

test('only an error without a response counts as no connection', () => {
	expect(isNetworkError(new Error('Network Error'))).toBe(true);
	expect(isNetworkError(Object.assign(new Error('401'), { response: { status: 401 } }))).toBe(false);
});

test('the save time reads as a Spanish date', () => {
	expect(formatSavedAt('2026-11-20T09:30:00Z')).toMatch(/^20 de noviembre de 2026/);
});
