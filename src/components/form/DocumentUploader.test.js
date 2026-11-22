import React, { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import DocumentUploader from "./DocumentUploader";

// Synthetic files only.
const pdf = (name) => new File(["%PDF-1.7"], name, { type: "application/pdf" });

const Harness = ({ initial }) => {
  const [files, setFiles] = useState(initial);
  return <DocumentUploader id="diagnostico" label="Informe de diagnóstico" files={files} onFilesChange={setFiles} />;
};

const order = () =>
  within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map((item) => item.querySelector(".file-name").textContent);

test("the up and down buttons change the page order and keep the focus on the moved file", async () => {
  const user = userEvent.setup();
  render(<Harness initial={[pdf("a.pdf"), pdf("b.pdf"), pdf("c.pdf")]} />);

  await user.click(screen.getByRole("button", { name: "Mover c.pdf antes" }));
  expect(order()).toEqual(["a.pdf", "c.pdf", "b.pdf"]);
  expect(screen.getByRole("button", { name: "Mover c.pdf antes" })).toHaveFocus();

  await user.keyboard("{Enter}");
  expect(order()).toEqual(["c.pdf", "a.pdf", "b.pdf"]);
  // c.pdf is first now: its "antes" button is disabled, so the focus goes to "después".
  expect(screen.getByRole("button", { name: "Mover c.pdf antes" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Mover c.pdf después" })).toHaveFocus();
  expect(screen.getByRole("status")).toHaveTextContent("c.pdf: ahora es el 1 de 3.");

  await user.click(screen.getByRole("button", { name: "Mover a.pdf después" }));
  expect(order()).toEqual(["c.pdf", "b.pdf", "a.pdf"]);
  expect(screen.getByRole("button", { name: "Mover a.pdf después" })).toBeDisabled();
});

test("one file has no move buttons, and the copy recommends a single PDF", () => {
  render(<Harness initial={[pdf("informe.pdf")]} />);
  expect(screen.queryByRole("button", { name: /Mover/ })).not.toBeInTheDocument();
  expect(screen.getByText(/Mejor un solo PDF/)).toHaveTextContent("hasta 10 archivos en total");
});
