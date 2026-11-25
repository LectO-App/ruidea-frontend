import React from "react";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import PasoDocumentos from "./PasoDocumentos";

// Synthetic values only.
const pdf = (name) => new File(["%PDF-1.7"], name, { type: "application/pdf" });

const renderStep = (props) =>
  render(
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

test("the step says several files are joined into one PDF", () => {
  renderStep();
  expect(screen.getByText(/juntamos en un único PDF/)).toBeInTheDocument();
});

test("editing a record with a PDF offers to add the new files or replace the current ones", async () => {
  const user = userEvent.setup();
  const setDocMode = jest.fn();
  renderStep({
    editing: true,
    formData: { archivoBlob: "aaaaaaaaaaaaaaaaaaaaaaaa/2026-03-01T00:00:00.000Z.pdf" },
    files: { diagnostico: [pdf("nuevo.pdf")], documento: [] },
    setDocMode,
  });
  expect(screen.getByRole("radio", { name: "Guardarlos y añadir los nuevos al final" })).toBeChecked();
  await user.click(screen.getByRole("radio", { name: "Cambiarlos por los nuevos" }));
  expect(setDocMode).toHaveBeenCalledWith("reemplazar");
});

test("editing a record with an older ZIP only replaces, and says so", () => {
  renderStep({
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
  renderStep({ files: { diagnostico: many("d", 6), documento: many("i", 5) }, onNext });
  await user.click(screen.getByRole("checkbox", { name: /Doy mi consentimiento/ }));
  await user.click(screen.getByRole("button", { name: /Revisar/ }));
  expect(screen.getByRole("alert")).toHaveTextContent("hasta 10 archivos en total");
  expect(onNext).not.toHaveBeenCalled();
});

test("a step opened for the report shows only its uploader, and both when replacing the PDF", () => {
  const props = {
    editing: true,
    singleStep: true,
    campos: new Set(["informe"]),
    formData: { archivoBlob: "aaaaaaaaaaaaaaaaaaaaaaaa/2026-03-01T00:00:00.000Z.pdf" },
    files: { diagnostico: [pdf("nuevo.pdf")], documento: [] },
  };
  const { unmount } = renderStep(props);
  expect(screen.getByText("Informe de diagnóstico")).toBeInTheDocument();
  expect(screen.queryByText("DNI, NIE o pasaporte")).not.toBeInTheDocument();
  unmount();

  renderStep({ ...props, docMode: "reemplazar" });
  expect(screen.getByText("DNI, NIE o pasaporte")).toBeInTheDocument();
});

test("a file over 25 MB is named before sending, with what to do", async () => {
  const user = userEvent.setup();
  const onNext = jest.fn();
  const big = pdf("escaneo.pdf");
  Object.defineProperty(big, "size", { value: 30 * 1024 * 1024 });
  renderStep({ files: { diagnostico: [big], documento: [] }, onNext });
  await user.click(screen.getByRole("checkbox", { name: /Doy mi consentimiento/ }));
  await user.click(screen.getByRole("button", { name: /Revisar/ }));
  const alert = screen.getByRole("alert");
  expect(alert).toHaveTextContent("«escaneo.pdf» ocupa 30.0 MB");
  expect(alert).toHaveTextContent("menos resolución");
  expect(alert).not.toHaveTextContent("inténtalo otra vez");
  expect(onNext).not.toHaveBeenCalled();
});

test("a size problem the server found on sending is shown on this step", () => {
  renderStep({ documentsError: "Un archivo ocupa más de 25 MB, el máximo por archivo." });
  expect(screen.getByRole("alert")).toHaveTextContent("Un archivo ocupa más de 25 MB");
});
