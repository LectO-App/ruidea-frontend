import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AdminSolicitudes from "./AdminSolicitudes";
import { axiosInstance } from "../../axios";

jest.mock("../../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// The shape POST /admin/solicitudes answers for a draft (ruidea-backend functions/drafts.js). Synthetic.
const pasos = (done) =>
  [
    ["datos", "Tus datos"],
    ["residencia", "Residencia y documento"],
    ["diagnostico", "Diagnóstico"],
    ["documentos", "Documentos"],
    ["revision", "Revisar y enviar"],
  ].map(([clave, titulo]) => ({ clave, titulo, completo: done.includes(clave) }));

const DRAFT = {
  _id: "d1",
  nombre: "Prueba",
  apellidos: "Sintética",
  correoElectronico: "d1@example.test",
  estado: "borrador",
  emailVerificado: false,
  fechaCreacion: "2026-11-01T10:00:00.000Z",
  progreso: { pasos: pasos(["datos", "residencia"]) },
  ultimoRecordatorio: "2026-11-15T10:00:00.000Z",
};
const PENDING = { ...DRAFT, _id: "p1", correoElectronico: "p1@example.test", estado: "pendiente", emailVerificado: true, progreso: undefined, ultimoRecordatorio: undefined };

const renderList = (rows) => {
  axiosInstance.post.mockImplementation((url) =>
    url === "/admin/solicitudes" ? Promise.resolve({ data: rows }) : Promise.resolve({ data: { ok: true } })
  );
  render(
    <MemoryRouter>
      <AdminSolicitudes history={{ push: jest.fn() }} />
    </MemoryRouter>
  );
};

const draftRow = async () => (await screen.findByText("d1@example.test")).closest("tr");

beforeEach(() => jest.clearAllMocks());

test("a draft row shows the steps done, the steps missing and the last reminder", async () => {
  renderList([DRAFT]);
  const row = within(await draftRow());
  expect(row.getByText("Sin terminar")).toBeInTheDocument();
  expect(row.getByText("2 de 5 pasos")).toBeInTheDocument();
  expect(row.getByText("Falta: Diagnóstico, Documentos, Revisar y enviar")).toBeInTheDocument();
  expect(row.getByText(/Recordatorio enviado el 15 nov 2026/)).toBeInTheDocument();
  expect(row.queryByRole("button", { name: "Reenviar correo" })).not.toBeInTheDocument();
});

test("Enviar recordatorio posts the reminder route and updates the last-sent date", async () => {
  renderList([{ ...DRAFT, ultimoRecordatorio: undefined }]);
  axiosInstance.post.mockImplementation((url) =>
    url === "/admin/solicitudes"
      ? Promise.resolve({ data: [{ ...DRAFT, ultimoRecordatorio: undefined }] })
      : Promise.resolve({ data: { ok: true, ultimoRecordatorio: "2026-11-20T09:00:00.000Z" } })
  );
  const row = within(await draftRow());
  expect(row.queryByText(/Recordatorio enviado/)).not.toBeInTheDocument();

  await userEvent.click(row.getByRole("button", { name: "Enviar recordatorio" }));

  expect(axiosInstance.post).toHaveBeenCalledWith("/admin/borradores/d1/recordatorio");
  expect(await row.findByText(/Recordatorio enviado el 20 nov 2026/)).toBeInTheDocument();
});

test("Cancelar solicitud asks for confirmation, then deletes the draft and tells the person by default", async () => {
  renderList([DRAFT, PENDING]);
  const row = within(await draftRow());

  await userEvent.click(row.getByRole("button", { name: "Cancelar solicitud" }));
  const dialog = await screen.findByRole("dialog", { name: "Cancelar la solicitud sin terminar" });
  expect(within(dialog).getByText(/Se borrarán los datos que guardó y los documentos que subió/)).toBeInTheDocument();
  expect(within(dialog).getByText(/podrá registrarse otra vez con el mismo correo/)).toBeInTheDocument();
  expect(within(dialog).getByRole("checkbox", { name: "Avisar a la persona por correo" })).toBeChecked();
  expect(axiosInstance.post).not.toHaveBeenCalledWith("/admin/borradores/d1/cancelar", expect.anything());

  await userEvent.click(within(dialog).getByRole("button", { name: "Sí, cancelar la solicitud" }));

  expect(axiosInstance.post).toHaveBeenCalledWith("/admin/borradores/d1/cancelar", { avisar: true });
  await waitFor(() => expect(screen.queryByText("d1@example.test")).not.toBeInTheDocument());
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByText("p1@example.test")).toBeInTheDocument();
});

test("unticking the checkbox cancels without emailing, and Volver cancels nothing", async () => {
  renderList([DRAFT]);
  const row = within(await draftRow());

  await userEvent.click(row.getByRole("button", { name: "Cancelar solicitud" }));
  await userEvent.click(within(await screen.findByRole("dialog")).getByRole("button", { name: "Volver" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(screen.getByText("d1@example.test")).toBeInTheDocument();

  await userEvent.click(row.getByRole("button", { name: "Cancelar solicitud" }));
  const dialog = await screen.findByRole("dialog");
  await userEvent.click(within(dialog).getByRole("checkbox", { name: "Avisar a la persona por correo" }));
  await userEvent.click(within(dialog).getByRole("button", { name: "Sí, cancelar la solicitud" }));

  expect(axiosInstance.post).toHaveBeenCalledWith("/admin/borradores/d1/cancelar", { avisar: false });
});

test("a sent application has neither draft action", async () => {
  renderList([PENDING]);
  const row = within((await screen.findByText("p1@example.test")).closest("tr"));
  expect(row.getByRole("button", { name: "Revisar" })).toBeInTheDocument();
  expect(row.queryByRole("button", { name: "Enviar recordatorio" })).not.toBeInTheDocument();
  expect(row.queryByRole("button", { name: "Cancelar solicitud" })).not.toBeInTheDocument();
});
