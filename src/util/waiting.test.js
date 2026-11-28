import { daysWaiting, esperandoLabel, waitingSince } from "./waiting";

const NOW = Date.parse("2026-11-28T12:00:00.000Z");

test("an application waits from fechaEnvio, or from fechaCreacion when it has none", () => {
  expect(waitingSince({ fechaEnvio: "2026-11-03T12:00:00.000Z", fechaCreacion: "2026-10-01T00:00:00.000Z" })).toBe(
    Date.parse("2026-11-03T12:00:00.000Z")
  );
  expect(daysWaiting({ fechaEnvio: null, fechaCreacion: "2026-11-27T11:00:00.000Z" }, NOW)).toBe(1);
  expect(daysWaiting({ fechaEnvio: "2026-11-03T12:00:00.000Z" }, NOW)).toBe(25);
  expect(daysWaiting({}, NOW)).toBeNull();
});

test.each([
  [0, "Esperando desde hoy"],
  [1, "Esperando 1 día"],
  [25, "Esperando 25 días"],
])("%i days reads as %s", (days, label) => {
  expect(esperandoLabel(days)).toBe(label);
});
