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
