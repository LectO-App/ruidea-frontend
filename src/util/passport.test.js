import { passportUrl, paddedPassportNumber } from './passport';

const origin = window.location.origin;

test('the share link uses the random share token', () => {
	expect(passportUrl({ shareToken: 'abc/def', numeroDocumento: '40111222', numeroPasaporte: 7 })).toBe(
		`${origin}/verificar/abc%2Fdef`
	);
});

test('without a share token the link falls back to the legacy number link', () => {
	expect(passportUrl({ numeroDocumento: '40111222', numeroPasaporte: 7 })).toBe(`${origin}/verificar/40111222/7`);
});

test.each([
	[1042, '0001042'],
	[7, '0000007'],
	[1234567, '1234567'],
])('passport number %s is shown as %s', (n, shown) => {
	expect(paddedPassportNumber(n)).toBe(shown);
});
