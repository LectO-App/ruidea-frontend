import { axiosInstance } from "./axios";

// The session cookie must be sent cross-origin and no public API key may be attached
// (SECURITY_ASSESSMENT.md §1.1). This locks in the post-migration auth contract.
test("axios instance sends credentials (cookies) cross-origin", () => {
  expect(axiosInstance.defaults.withCredentials).toBe(true);
});

test("axios instance has no static API key header", () => {
  const headers = JSON.stringify(axiosInstance.defaults.headers || {});
  expect(headers.toLowerCase()).not.toContain("authkey");
});

describe("GET /usuario/me keeps the offline passport copy in step", () => {
  // Synthetic values only.
  const approved = {
    nombre: "Ana",
    apellidos: "Prueba",
    emailVerificado: true,
    estado: "aceptado",
    numeroPasaporte: 1042,
    numeroDocumento: "SINT-0001-X",
    shareToken: "token-de-prueba",
  };
  const answer = (status, data) => (config) =>
    status < 400
      ? Promise.resolve({ data, status, statusText: "", headers: {}, config })
      : Promise.reject(Object.assign(new Error(String(status)), { config, response: { status, data } }));
  const getMe = (status, data) =>
    axiosInstance.get("/usuario/me", { adapter: answer(status, data) }).catch(() => null);

  afterEach(() => window.localStorage.clear());

  test("an approved answer saves the copy and a not-approved one deletes it", async () => {
    await getMe(200, approved);
    expect(JSON.parse(window.localStorage.getItem("ruidea-pasaporte")).numeroPasaporte).toBe("0001042");
    await getMe(200, { ...approved, estado: "revision" });
    expect(window.localStorage.getItem("ruidea-pasaporte")).toBeNull();
  });

  test("a 404 (account gone) deletes the copy; a 401 keeps it", async () => {
    await getMe(200, approved);
    await getMe(401, {});
    expect(window.localStorage.getItem("ruidea-pasaporte")).not.toBeNull();
    await getMe(404, {});
    expect(window.localStorage.getItem("ruidea-pasaporte")).toBeNull();
  });

  test("other requests leave the copy alone", async () => {
    await getMe(200, approved);
    await axiosInstance.get("/admin/me", { adapter: answer(200, { admin: true }) });
    expect(window.localStorage.getItem("ruidea-pasaporte")).not.toBeNull();
  });
});
