import { fechaLarga, horaComprobacion } from './fechas';

test('a stored birth date reads in words, on the stored day', () => {
	expect(fechaLarga('2017-04-12T00:00:00.000Z')).toBe('12 de abril de 2017');
	expect(fechaLarga('2012-05-01T00:00:00.000Z')).toBe('1 de mayo de 2012');
	expect(fechaLarga('not a date')).toBe('');
});

test('the check time shows weekday, date and seconds from the device clock', () => {
	expect(horaComprobacion(new Date(2026, 10, 28, 9, 3, 7))).toBe('sábado 28 nov 2026, 09:03:07');
});
