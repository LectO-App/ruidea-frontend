import { capitalizedDiagnostic } from "./capitalize";

test("maps known diagnostic keys to labels", () => {
  expect(capitalizedDiagnostic("tdah")).toBe("TDA-H");
  expect(capitalizedDiagnostic("dislexia")).toBe("Dislexia");
});

test("falls back to the raw value for unknown keys", () => {
  expect(capitalizedDiagnostic("unknown")).toBe("unknown");
});
