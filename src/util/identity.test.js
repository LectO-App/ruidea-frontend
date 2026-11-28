import {
  fechaEnPalabras,
  fechaCorta,
  edad,
  isValidDni,
  isValidNie,
  documentoError,
  looksLikePhone,
  suggestEmail,
  partsToISODate,
  isoToParts,
  passwordStrength,
} from "./identity";

test("DNI checksum", () => {
  expect(isValidDni("12345678Z")).toBe(true);
  expect(isValidDni("12345678A")).toBe(false);
});

test("NIE checksum", () => {
  expect(isValidNie("X1234567L")).toBe(true);
  expect(isValidNie("X1234567Z")).toBe(false);
});

test("documentoError checks the DNI letter only for Spain", () => {
  expect(documentoError("dni", "12345678Z", "España")).toBeNull();
  expect(documentoError("dni", "12345678A", "España")).toMatch(/DNI/);
  expect(documentoError("dni", "", "España")).toMatch(/documento/);
  // Argentina (and other countries): a letterless numeric DNI is fine.
  expect(documentoError("dni", "45570422", "Argentina")).toBeNull();
  expect(documentoError("dni", "12345678A", "Argentina")).toBeNull();
});

test("looksLikePhone accepts plausible numbers, rejects nonsense", () => {
  expect(looksLikePhone("600123123")).toBe(true);
  expect(looksLikePhone("+34 600 123 123")).toBe(true);
  expect(looksLikePhone("123")).toBe(false);
  expect(looksLikePhone("abc")).toBe(false);
});

test("suggestEmail catches near-miss domains only", () => {
  expect(suggestEmail("juan@gmial.com")).toBe("juan@gmail.com");
  expect(suggestEmail("juan@gmail.com")).toBeNull();
  expect(suggestEmail("juan@miempresa.es")).toBeNull();
});

test("date parts round-trip and reject impossible dates", () => {
  expect(partsToISODate("1", "5", "2010")).toBe("2010-05-01");
  expect(partsToISODate("31", "2", "2010")).toBeNull();
  expect(partsToISODate("", "5", "2010")).toBeNull();
  expect(isoToParts("2010-05-01")).toEqual({ dia: "1", mes: "5", anio: "2010" });
});

test("passwordStrength scales with complexity", () => {
  expect(passwordStrength("short").score).toBe(0);
  expect(passwordStrength("password1").score).toBeGreaterThanOrEqual(1);
  expect(passwordStrength("Sup3r-Secret-Pass").score).toBe(4);
});

test('fechaEnPalabras writes the date out in Spanish words', () => {
  expect(fechaEnPalabras('1984-05-03')).toBe('3 de mayo de 1984');
  expect(fechaEnPalabras('2012-12-31T00:00:00.000Z')).toBe('31 de diciembre de 2012');
  expect(fechaEnPalabras('')).toBe('');
});

test('fechaCorta shows an ISO date as dd/mm/yyyy', () => {
  expect(fechaCorta('1984-05-03')).toBe('03/05/1984');
  expect(fechaCorta('2012-12-31T00:00:00.000Z')).toBe('31/12/2012');
  expect(fechaCorta(undefined)).toBe('');
});

test('edad counts whole years, turning a year older on the birthday', () => {
  const hoy = new Date(2026, 4, 3);
  expect(edad('2008-05-03', hoy)).toBe(18);
  expect(edad('2008-05-04', hoy)).toBe(17);
  expect(edad('1984-05-03', hoy)).toBe(42);
  expect(edad('', hoy)).toBe(null);
});
