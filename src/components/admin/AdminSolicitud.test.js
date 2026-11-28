import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import AdminSolicitud from "./AdminSolicitud";
import { axiosInstance } from "../../axios";

jest.mock("../../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const NEXT = "bbbbbbbbbbbbbbbbbbbbbbbb";
const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY - 60 * 60 * 1000).toISOString();
const SAS = "https://storage.example.test/docs/report.pdf?sig=synthetic";

const USER = {
  _id: ID,
  nombre: "Prueba",
  apellidos: "Sintética",
  correoElectronico: "prueba@example.test",
  numeroDocumento: "00000000T",
  fechaNacimiento: "2012-05-04T00:00:00.000Z",
  diagnostico: { dislexia: true, tdah: false },
  estado: "pendiente",
  fechaEnvio: daysAgo(25),
  fechaCreacion: daysAgo(40),
  archivoBlob: `${ID}/2026-03-01T00:00:00.000Z.pdf`,
};

let siguiente;
const renderWith = (overrides = {}) => {
  axiosInstance.post.mockImplementation((url) =>
    url === `/admin/solicitudes/${ID}`
      ? Promise.resolve({ data: { usuario: { ...USER, ...overrides } } })
      : Promise.resolve({ data: { ok: true } })
  );
  axiosInstance.get.mockImplementation((url) => {
    if (url === "/admin/siguiente") return Promise.resolve({ data: siguiente });
    if (url.startsWith("/inscripcion/link-archivos/")) return Promise.resolve({ data: { url: SAS } });
    return Promise.reject(new Error(`unexpected ${url}`));
  });
  const history = { push: jest.fn() };
  render(
    <MemoryRouter>
      <AdminSolicitud match={{ params: { id: ID } }} history={history} />
    </MemoryRouter>
  );
  return history;
};

const checkRow = (label) =>
  within(screen.getByRole("group", { name: /^Compara con el documento/ })).getByText(label).closest("li");
const answer = (label, choice) =>
  userEvent.click(within(checkRow(label)).getByRole("button", { name: choice }));
const answerAll = async (choice) => {
  for (const label of [
    "Nombre completo",
    "DNI o documento",
    "Fecha de nacimiento",
    "Diagnóstico marcado",
    "Firma de un profesional con su n.º de colegiado",
  ]) {
    await answer(label, choice);
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  siguiente = { siguiente: { _id: NEXT, fechaEnvio: daysAgo(12), fechaCreacion: daysAgo(30) }, pendientes: 4 };
});

test("the PDF is embedded beside the data, with a link to open it in another tab", async () => {
  renderWith();
  const pane = await screen.findByRole("region", { name: "Informe y documento de identidad" });
  await waitFor(() => expect(pane.querySelector("object")).toHaveAttribute("data", SAS));
  expect(within(pane).getByRole("link", { name: "Abrir en otra pestaña" })).toHaveAttribute("href", SAS);
  expect(axiosInstance.get).toHaveBeenCalledWith(`/inscripcion/link-archivos/${ID}`);
});

test("an older ZIP record keeps the download button and embeds nothing", async () => {
  renderWith({ archivoBlob: `${ID}/2026-01-01T00:00:00.000Z.zip` });
  expect(await screen.findByRole("button", { name: "Descargar diagnóstico e identificación (ZIP)" })).toBeEnabled();
  expect(document.querySelector("object")).toBeNull();
});

test("a record without documents says so", async () => {
  renderWith({ archivoBlob: "" });
  expect(await screen.findByText("Sin documentos subidos.")).toBeInTheDocument();
});

test("the header shows when it was sent, who sent it and how long it has waited", async () => {
  renderWith({ esTutor: true, tutorNombre: "Tutora", tutorApellidos: "Ficticia", tutorParentesco: "Madre" });
  expect(await screen.findByText(/· presentada por Tutora Ficticia \(madre\)/)).toBeInTheDocument();
  expect(screen.getByText("Esperando 25 días")).toBeInTheDocument();
  expect(
    await screen.findByText("Después: siguiente pendiente, la que más tiempo lleva esperando (12 días).")
  ).toBeInTheDocument();
});

test("Aceptar stays disabled, with the reason as text, until all five points match", async () => {
  renderWith();
  const accept = await screen.findByRole("button", { name: "Aceptar solicitud" });
  expect(accept).toBeDisabled();
  expect(accept).toHaveAccessibleDescription("Marca los 5 puntos como «Coincide» primero.");
  expect(screen.getByRole("group", { name: "Compara con el documento · 0 de 5" })).toBeInTheDocument();

  await answer("Nombre completo", "Coincide");
  await answer("DNI o documento", "Coincide");
  await answer("Fecha de nacimiento", "Coincide");
  await answer("Diagnóstico marcado", "Coincide");
  expect(screen.getByText("· 4 de 5")).toBeInTheDocument();
  expect(accept).toBeDisabled();
  expect(screen.getByRole("button", { name: "Rechazar" })).toBeEnabled();
  expect(screen.getByRole("button", { name: "Pedir revisión" })).toBeEnabled();

  await answer("Firma de un profesional con su n.º de colegiado", "Coincide");
  expect(screen.getByText("· 5 de 5")).toBeInTheDocument();
  expect(accept).toBeEnabled();
  expect(within(checkRow("Nombre completo")).getByRole("button", { name: "Coincide" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("one No keeps Aceptar disabled and writes its reason into the revision message", async () => {
  renderWith();
  await screen.findByRole("button", { name: "Aceptar solicitud" });
  await answerAll("Coincide");
  await answer("Fecha de nacimiento", "No");

  expect(screen.getByRole("button", { name: "Aceptar solicitud" })).toBeDisabled();
  expect(screen.getByText("Hay puntos que no coinciden: pide revisión o rechaza.")).toBeInTheDocument();
  expect(within(checkRow("Fecha de nacimiento")).getByRole("button", { name: "No" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  expect(within(checkRow("Fecha de nacimiento")).getByText(/este motivo irá ya escrito/)).toBeInTheDocument();

  await answer("Firma de un profesional con su n.º de colegiado", "No");
  await userEvent.click(screen.getByRole("button", { name: "Pedir revisión (2 motivos)" }));
  const message = await screen.findByLabelText("Mensaje para el usuario");
  expect(message).toHaveValue(
    "La fecha de nacimiento no coincide con la del documento de identidad.\n" +
      "El informe no tiene la firma de un profesional con su número de colegiado."
  );

  await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
  expect(axiosInstance.post).toHaveBeenCalledWith("/admin/respuesta", {
    estado: "revision",
    mensajeMedico: message.value,
    emailUsuario: USER.correoElectronico,
  });
});

test("after accepting, the reviewer lands on the next pending application", async () => {
  const history = renderWith();
  await screen.findByRole("button", { name: "Aceptar solicitud" });
  await answerAll("Coincide");
  await userEvent.click(screen.getByRole("button", { name: "Aceptar solicitud" }));

  await waitFor(() => expect(history.push).toHaveBeenCalledWith(`/admin/solicitudes/${NEXT}`));
  expect(axiosInstance.post).toHaveBeenCalledWith("/admin/respuesta", {
    estado: "aceptado",
    mensajeMedico: "",
    emailUsuario: USER.correoElectronico,
  });
  expect(axiosInstance.get).toHaveBeenLastCalledWith("/admin/siguiente", { params: { excluir: ID } });
});

test("after rejecting the last pending application, the reviewer goes back to the list", async () => {
  siguiente = { siguiente: null, pendientes: 0 };
  const history = renderWith();
  expect(await screen.findByText("Después: no quedan más pendientes, volverás a la lista.")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Rechazar" }));
  await userEvent.click(await screen.findByRole("button", { name: "Sí, rechazar" }));

  await waitFor(() => expect(history.push).toHaveBeenCalledWith("/admin/solicitudes"));
  expect(history.push).toHaveBeenCalledTimes(1);
});

test("a failed answer stays on the application", async () => {
  const history = renderWith();
  await screen.findByRole("button", { name: "Rechazar" });
  axiosInstance.post.mockRejectedValueOnce(new Error("down"));
  await userEvent.click(screen.getByRole("button", { name: "Rechazar" }));
  await userEvent.click(await screen.findByRole("button", { name: "Sí, rechazar" }));

  await waitFor(() => expect(axiosInstance.post).toHaveBeenCalledWith("/admin/respuesta", expect.anything()));
  expect(history.push).not.toHaveBeenCalled();
});

test("an accepted application has no checks", async () => {
  renderWith({ estado: "aceptado" });
  expect(await screen.findByRole("button", { name: "Certificado PDF" })).toBeInTheDocument();
  expect(screen.queryByText("Compara con el documento")).not.toBeInTheDocument();
  expect(screen.queryByText(/Esperando/)).not.toBeInTheDocument();
});
