import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";

import AdminSolicitud from "./AdminSolicitud";
import { axiosInstance } from "../../axios";

jest.mock("../../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const ID = "aaaaaaaaaaaaaaaaaaaaaaaa";
const renderWith = (archivoBlob) => {
  axiosInstance.post.mockResolvedValue({
    data: { usuario: { _id: ID, nombre: "Prueba", apellidos: "Sintética", estado: "pendiente", archivoBlob } },
  });
  render(
    <MemoryRouter>
      <AdminSolicitud match={{ params: { id: ID } }} history={{ push: jest.fn() }} />
    </MemoryRouter>
  );
};

test.each([
  [`${ID}/2026-03-01T00:00:00.000Z.pdf`, "Abrir diagnóstico e identificación (PDF, pestaña nueva)"],
  [`${ID}/2026-01-01T00:00:00.000Z.zip`, "Descargar diagnóstico e identificación (ZIP)"],
])("the documents button for %s says what it opens", async (archivoBlob, label) => {
  renderWith(archivoBlob);
  expect(await screen.findByRole("button", { name: label })).toBeEnabled();
});

test("a record without documents has a disabled documents button", async () => {
  renderWith("");
  expect(await screen.findByRole("button", { name: "Sin documentos subidos" })).toBeDisabled();
});
