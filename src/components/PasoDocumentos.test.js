import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TextEncoder } from "util";
import { useState } from "react";
import { within, waitFor } from "@testing-library/react";

import PasoDocumentos from "./PasoDocumentos";
import { axiosInstance } from "../axios";

// jsdom has no TextEncoder; qrcode needs it to encode the phone link.
global.TextEncoder = TextEncoder;

jest.mock("../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn(), delete: jest.fn() } }));

// Synthetic values only.
const pdf = (name) => new File(["%PDF-1.7"], name, { type: "application/pdf" });
const staged = (id, grupo, orden = 1) => ({ id, grupo, orden, tipo: "image/jpeg", tamano: 1000, url: `https://storage.test/${id}` });

beforeEach(() => {
  axiosInstance.post.mockResolvedValue({
    data: { token: "T".repeat(43), codigo: "123456", caduca: new Date(Date.now() + 15 * 60000).toISOString() },
  });
  axiosInstance.get.mockResolvedValue({ data: { archivos: [], movilConectado: false } });
  axiosInstance.delete.mockResolvedValue({ data: { borrado: true } });
});

// The phone card asks the server on opening; wait for its answers so they land inside the test.
const renderStep = async (props) => {
  const view = render(
    <MemoryRouter>
      <PasoDocumentos
        formData={{}}
        files={{ diagnostico: [], documento: [] }}
        setFiles={jest.fn()}
        onNext={jest.fn()}
        onBack={jest.fn()}
        editing={false}
        docMode="agregar"
        setDocMode={jest.fn()}
        {...props}
      />
    </MemoryRouter>
  );
  await screen.findByText("123 456");
  await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled());
  return view;
};

test("the step says several files are joined into one PDF", async () => {
  await renderStep();
  expect(screen.getByText(/juntamos en un único PDF/)).toBeInTheDocument();
});

test("editing a record with a PDF offers to add the new files or replace the current ones", async () => {
  const user = userEvent.setup();
  const setDocMode = jest.fn();
  await renderStep({
    editing: true,
    formData: { archivoBlob: "aaaaaaaaaaaaaaaaaaaaaaaa/2026-03-01T00:00:00.000Z.pdf" },
    files: { diagnostico: [pdf("nuevo.pdf")], documento: [] },
    setDocMode,
  });
  expect(screen.getByRole("radio", { name: "Guardarlos y añadir los nuevos al final" })).toBeChecked();
  await user.click(screen.getByRole("radio", { name: "Cambiarlos por los nuevos" }));
  expect(setDocMode).toHaveBeenCalledWith("reemplazar");
});

test("editing a record with an older ZIP only replaces, and says so", async () => {
  await renderStep({
    editing: true,
    formData: { archivoBlob: "aaaaaaaaaaaaaaaaaaaaaaaa/2026-01-01T00:00:00.000Z.zip" },
    files: { diagnostico: [pdf("nuevo.pdf")], documento: [] },
  });
  expect(screen.queryByRole("radio", { name: /añadir/ })).not.toBeInTheDocument();
  expect(screen.getByText(/sustituirán a los documentos/)).toBeInTheDocument();
});

test("more than 10 files in total are stopped before sending", async () => {
  const user = userEvent.setup();
  const onNext = jest.fn();
  const many = (prefix, n) => Array.from({ length: n }, (_, i) => pdf(`${prefix}${i}.pdf`));
  await renderStep({ files: { diagnostico: many("d", 6), documento: many("i", 5) }, onNext });
  await user.click(screen.getByRole("checkbox", { name: /Doy mi consentimiento/ }));
  await user.click(screen.getByRole("button", { name: /Revisar/ }));
  expect(screen.getByRole("alert")).toHaveTextContent("hasta 10 archivos en total");
  expect(onNext).not.toHaveBeenCalled();
});

test("a file over 25 MB is named before sending, with what to do", async () => {
  const user = userEvent.setup();
  const onNext = jest.fn();
  const big = pdf("escaneo.pdf");
  Object.defineProperty(big, "size", { value: 30 * 1024 * 1024 });
  await renderStep({ files: { diagnostico: [big], documento: [] }, onNext });
  await user.click(screen.getByRole("checkbox", { name: /Doy mi consentimiento/ }));
  await user.click(screen.getByRole("button", { name: /Revisar/ }));
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent("«escaneo.pdf» ocupa 30.0 MB");
  expect(alert).toHaveTextContent("menos resolución");
  expect(alert).not.toHaveTextContent("inténtalo otra vez");
  expect(onNext).not.toHaveBeenCalled();
});

test("a size problem the server found on sending is shown on this step", async () => {
  await renderStep({ documentsError: "Un archivo ocupa más de 25 MB, el máximo por archivo." });
  expect(screen.getByRole("alert")).toHaveTextContent("Un archivo ocupa más de 25 MB");
});

const Harness = (props) => {
  const [files, setFiles] = useState({ diagnostico: [pdf("informe.pdf")], documento: [] });
  return (
    <MemoryRouter>
      <PasoDocumentos
        formData={{}}
        files={files}
        setFiles={setFiles}
        onNext={jest.fn()}
        onBack={jest.fn()}
        editing={false}
        docMode="agregar"
        setDocMode={jest.fn()}
        {...props}
      />
    </MemoryRouter>
  );
};

const listOf = (label) => within(screen.getByRole("list", { name: `Archivos de ${label}, en el orden de las páginas` }));

test("the phone card sits above the uploader, which keeps working as before", async () => {
  await renderStep();
  expect(screen.getByRole("heading", { name: /Hazles una foto con el móvil/ })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "¿Lo tienes en el ordenador? Elige el archivo aquí, como siempre." })).toBeInTheDocument();
  expect(await screen.findByText("123 456")).toBeInTheDocument();
});

test("phone photos join the right numbered list, tagged, and can be moved and removed like picked files", async () => {
  const user = userEvent.setup();
  axiosInstance.get.mockResolvedValue({
    data: { archivos: [staged("aaaaaaaaaaaaaaaaaaaaaaaa", "diagnostico"), staged("bbbbbbbbbbbbbbbbbbbbbbbb", "documento")], movilConectado: true },
  });
  render(<Harness />);

  await waitFor(() => expect(listOf("Informe de diagnóstico").getAllByRole("listitem")).toHaveLength(2));
  const photo = listOf("Informe de diagnóstico").getAllByRole("listitem")[1];
  expect(photo).toHaveTextContent("Foto del móvil 1");
  expect(photo).toHaveTextContent("Desde tu móvil");
  expect(listOf("DNI, NIE o pasaporte").getAllByRole("listitem")).toHaveLength(1);

  await user.click(listOf("Informe de diagnóstico").getByRole("button", { name: "Mover Foto del móvil 1 antes" }));
  expect(listOf("Informe de diagnóstico").getAllByRole("listitem")[0]).toHaveTextContent("Foto del móvil 1");

  axiosInstance.get.mockResolvedValue({ data: { archivos: [staged("bbbbbbbbbbbbbbbbbbbbbbbb", "documento")], movilConectado: true } });
  await user.click(listOf("Informe de diagnóstico").getByRole("button", { name: "Quitar Foto del móvil 1" }));
  expect(axiosInstance.delete).toHaveBeenCalledWith("/movil/archivos/aaaaaaaaaaaaaaaaaaaaaaaa");
  expect(listOf("Informe de diagnóstico").getAllByRole("listitem")).toHaveLength(1);
});

test("a phone photo is not counted in the size sent from this computer", async () => {
  const user = userEvent.setup();
  const onNext = jest.fn();
  const big = { movil: true, id: "c".repeat(24), name: "Foto del móvil 1", type: "image/jpeg", size: 70 * 1024 * 1024 };
  await renderStep({ files: { diagnostico: [big], documento: [] }, onNext });
  await user.click(screen.getByRole("checkbox", { name: /Doy mi consentimiento/ }));
  await user.click(screen.getByRole("button", { name: /Revisar/ }));
  expect(onNext).toHaveBeenCalled();
});
