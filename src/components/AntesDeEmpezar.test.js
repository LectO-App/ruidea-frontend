import React from "react";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Form from "./Form";
import { SIN_INFORME_NOTA } from "./AntesDeEmpezar";
import { getOwn } from "../util/registrationApi";

jest.mock("../util/registrationApi", () => ({
  getOwn: jest.fn(),
  startDraft: jest.fn(),
  patchDraft: jest.fn(),
  submitDraft: jest.fn(),
  registerOneShot: jest.fn(),
  updateOwn: jest.fn(),
  uploadFiles: jest.fn(),
  checkMail: jest.fn(),
}));

const renderForm = () =>
  render(
    <HelmetProvider>
      <MemoryRouter>
        <Form location={{}} history={{ push: jest.fn() }} />
      </MemoryRouter>
    </HelmetProvider>
  );

const showList = async (user, { paraQuien, informe }) => {
  await screen.findByRole("heading", { name: "Veamos qué vas a necesitar" });
  if (paraQuien) await user.click(screen.getByRole("radio", { name: paraQuien }));
  if (informe) await user.click(screen.getByRole("radio", { name: informe }));
  await user.click(screen.getByRole("button", { name: "Ver qué necesito" }));
  return screen.findByRole("heading", { name: "Ten esto a mano" });
};

beforeEach(() => {
  sessionStorage.clear();
  getOwn.mockResolvedValue(null);
});

test("with no session and no draft, the screen shows before Crear cuenta and is not a numbered step", async () => {
  renderForm();
  expect(await screen.findByRole("heading", { name: "Veamos qué vas a necesitar" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "¿Para quién es el pasaporte?" })).toBeInTheDocument();
  expect(screen.getByRole("group", { name: "¿Tienes ya el informe del diagnóstico?" })).toBeInTheDocument();
  expect(screen.queryByText(/Paso/)).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Crear cuenta" })).not.toBeInTheDocument();
});

test("a draft goes straight to its step", async () => {
  getOwn.mockResolvedValue({ _id: "u1", estado: "borrador", correoElectronico: "persona@example.com" });
  renderForm();
  expect(await screen.findByRole("heading", { name: "Tus datos" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Veamos qué vas a necesitar" })).not.toBeInTheDocument();
});

test("a submitted record being edited goes straight to its step", async () => {
  getOwn.mockResolvedValue({ _id: "u1", estado: "pendiente", correoElectronico: "persona@example.com" });
  renderForm();
  expect(await screen.findByRole("heading", { name: "Tus datos" })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "Veamos qué vas a necesitar" })).not.toBeInTheDocument();
});

test("skip goes straight to Crear cuenta", async () => {
  const user = userEvent.setup();
  renderForm();
  await screen.findByRole("heading", { name: "Veamos qué vas a necesitar" });
  await user.click(screen.getByRole("button", { name: "Saltar e ir al formulario" }));
  expect(await screen.findByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
  expect(screen.getByText(/de 6/)).toBeInTheDocument();
});

test("Empezar la solicitud goes to Crear cuenta", async () => {
  const user = userEvent.setup();
  renderForm();
  await showList(user, { paraQuien: "Para mí", informe: "Sí, lo tengo" });
  await user.click(screen.getByRole("button", { name: "Empezar la solicitud" }));
  expect(await screen.findByRole("heading", { name: "Crear cuenta" })).toBeInTheDocument();
});

test("the list moves focus to its heading and has no checkboxes", async () => {
  const user = userEvent.setup();
  renderForm();
  const heading = await showList(user, { paraQuien: "Para mí", informe: "Sí, lo tengo" });
  expect(heading).toHaveFocus();
  expect(screen.queryAllByRole("checkbox")).toHaveLength(0);
  expect(document.querySelectorAll('input[type="checkbox"]')).toHaveLength(0);
  expect(screen.getByText("El informe del diagnóstico")).toBeInTheDocument();
  expect(screen.getByText("Un correo que mires a menudo")).toBeInTheDocument();
  expect(
    screen.getByText(/Se guarda solo\. Si te falta algo, puedes parar en cualquier paso y seguir otro día\./)
  ).toBeInTheDocument();
});

test("the guardian item shows only for Para alguien que cuido", async () => {
  const user = userEvent.setup();
  renderForm();
  await showList(user, { paraQuien: "Para mí", informe: "Sí, lo tengo" });
  expect(screen.queryByText("Tus datos como tutor o tutora")).not.toBeInTheDocument();
  expect(screen.getByText(/^El tuyo, por las dos caras/)).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Cambiar respuestas" }));
  await showList(user, { paraQuien: /Para alguien que cuido/ });
  expect(screen.getByText("Tus datos como tutor o tutora")).toBeInTheDocument();
  expect(screen.getByText(/^El de la persona que cuidas, por las dos caras/)).toBeInTheDocument();
});

test.each(["Todavía no", "No sé qué es"])("the no-report note shows for %s", async (informe) => {
  const user = userEvent.setup();
  renderForm();
  await showList(user, { paraQuien: "Para mí", informe });
  expect(screen.getByText(SIN_INFORME_NOTA)).toBeInTheDocument();
});

test("the no-report note does not show when the report is to hand", async () => {
  const user = userEvent.setup();
  renderForm();
  await showList(user, { paraQuien: "Para mí", informe: "Sí, lo tengo" });
  expect(screen.queryByText(SIN_INFORME_NOTA)).not.toBeInTheDocument();
});

test("the print button calls window.print", async () => {
  const user = userEvent.setup();
  const print = jest.spyOn(window, "print").mockImplementation(() => {});
  renderForm();
  await showList(user, { paraQuien: "Para mí", informe: "Sí, lo tengo" });
  await user.click(screen.getByRole("button", { name: "Imprimir o guardar la lista" }));
  expect(print).toHaveBeenCalled();
  print.mockRestore();
});

test("the answers stay in sessionStorage and Para alguien que cuido pre-selects step 2", async () => {
  const user = userEvent.setup();
  renderForm();
  await showList(user, { paraQuien: /Para alguien que cuido/, informe: "Sí, lo tengo" });
  expect(JSON.parse(sessionStorage.getItem("ruidea.antesDeEmpezar"))).toEqual({ paraQuien: "otra", informe: "si" });
  await user.click(screen.getByRole("button", { name: "Empezar la solicitud" }));
  await screen.findByRole("heading", { name: "Crear cuenta" });
  const { startDraft, checkMail } = require("../util/registrationApi");
  expect(startDraft).not.toHaveBeenCalled();
  expect(checkMail).not.toHaveBeenCalled();

  checkMail.mockResolvedValue({ disponible: true });
  startDraft.mockResolvedValue({ id: "d1" });
  await user.type(screen.getByLabelText("Tu correo electrónico"), "persona@example.com");
  await user.type(screen.getByLabelText("Contraseña"), "una-clave-larga-123");
  await user.click(screen.getByRole("button", { name: "Continuar" }));

  await screen.findByRole("heading", { name: "Tus datos" });
  expect(startDraft).toHaveBeenCalledWith({
    correoElectronico: "persona@example.com",
    password: "una-clave-larga-123",
  });
  expect(await screen.findByRole("radio", { name: "Para alguien que cuido" })).toBeChecked();
  await user.click(screen.getByRole("radio", { name: "Para mí" }));
  expect(screen.getByRole("radio", { name: "Para mí" })).toBeChecked();
});
