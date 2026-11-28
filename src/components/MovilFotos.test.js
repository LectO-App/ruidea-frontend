import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

import MovilFotos from "./MovilFotos";
import { axiosInstance } from "../axios";

jest.mock("../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// Synthetic values only.
const TOKEN = "T".repeat(43);
const photo = () => new File(["foto"], "IMG_0001.jpg", { type: "image/jpeg" });
const expired = () => Object.assign(new Error("gone"), { response: { status: 410, data: { message: "Este enlace ha caducado." } } });

beforeEach(() => {
  URL.createObjectURL = jest.fn(() => "blob:foto");
  URL.revokeObjectURL = jest.fn();
  axiosInstance.get.mockReset();
  axiosInstance.post.mockReset();
});

const open = (path) =>
  render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[path]}>
        <Route exact path="/movil/:token?" component={MovilFotos} />
      </MemoryRouter>
    </HelmetProvider>
  );

test("the phone takes a photo of a paper, previews it and sends it to the computer", async () => {
  const user = userEvent.setup();
  axiosInstance.get.mockResolvedValue({ data: { caduca: new Date(Date.now() + 600000).toISOString() } });
  axiosInstance.post.mockResolvedValue({ data: { fotos: [{ id: "a", grupo: "documento", orden: 1 }] } });
  open(`/movil/${TOKEN}`);

  expect(await screen.findByRole("heading", { name: "¿Qué papel vas a fotografiar?" })).toHaveFocus();
  expect(axiosInstance.get).toHaveBeenCalledWith(`/movil/sesion/${TOKEN}`);
  await user.click(screen.getByRole("button", { name: /DNI, NIE o pasaporte/ }));

  const camera = screen.getByLabelText("Hacer la foto");
  expect(camera).toHaveAttribute("capture", "environment");
  expect(screen.getByLabelText("Elegir una foto de la galería")).not.toHaveAttribute("capture");
  await user.upload(camera, photo());

  expect(screen.getByRole("heading", { name: "¿Se lee bien el texto?" })).toBeInTheDocument();
  expect(screen.getByText("Si no se lee bien, repítela con más luz.")).toBeInTheDocument();
  expect(await screen.findByRole("img", { name: "La foto que acabas de hacer" })).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Usar esta foto" }));

  expect(await screen.findByRole("heading", { name: "Listo. Ya están en tu ordenador." })).toBeInTheDocument();
  expect(screen.getByText(/DNI, NIE o pasaporte: 1 foto/)).toBeInTheDocument();
  const [path, form] = axiosInstance.post.mock.calls[0];
  expect(path).toBe(`/movil/sesion/${TOKEN}/fotos`);
  expect(form.get("grupo")).toBe("documento");
  expect(form.get("foto").name).toBe("IMG_0001.jpg");

  await user.click(screen.getByRole("button", { name: "Hacer otra foto" }));
  expect(screen.getByRole("heading", { name: "¿Qué papel vas a fotografiar?" })).toBeInTheDocument();
});

test("Repetir goes back to the camera without sending", async () => {
  const user = userEvent.setup();
  axiosInstance.get.mockResolvedValue({ data: { caduca: new Date().toISOString() } });
  open(`/movil/${TOKEN}`);
  await user.click(await screen.findByRole("button", { name: /Informe de diagnóstico/ }));
  expect(screen.getByText(/Una foto por cada página/)).toBeInTheDocument();
  await user.upload(screen.getByLabelText("Hacer la foto"), photo());
  await user.click(screen.getByRole("button", { name: "Repetir" }));
  expect(screen.getByLabelText("Hacer la foto")).toBeInTheDocument();
  expect(axiosInstance.post).not.toHaveBeenCalled();
});

test("an expired link says to show a new code on the computer", async () => {
  axiosInstance.get.mockRejectedValue(expired());
  open(`/movil/${TOKEN}`);
  expect(await screen.findByRole("heading", { name: "Este enlace ha caducado" })).toBeInTheDocument();
  expect(screen.getByText(/Pide un código nuevo en el ordenador/)).toBeInTheDocument();
});

test("a link that expires while sending a photo says so too", async () => {
  const user = userEvent.setup();
  axiosInstance.get.mockResolvedValue({ data: { caduca: new Date().toISOString() } });
  axiosInstance.post.mockRejectedValue(expired());
  open(`/movil/${TOKEN}`);
  await user.click(await screen.findByRole("button", { name: /Informe de diagnóstico/ }));
  await user.upload(screen.getByLabelText("Hacer la foto"), photo());
  await user.click(screen.getByRole("button", { name: "Usar esta foto" }));
  expect(await screen.findByRole("heading", { name: "Este enlace ha caducado" })).toBeInTheDocument();
});

test("the typed code opens the photo page", async () => {
  const user = userEvent.setup();
  axiosInstance.post.mockResolvedValue({ data: { token: TOKEN } });
  axiosInstance.get.mockResolvedValue({ data: { caduca: new Date().toISOString() } });
  open("/movil");

  await user.type(screen.getByLabelText("Código"), "482 913");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  expect(axiosInstance.post).toHaveBeenCalledWith("/movil/codigo", { codigo: "482913" });
  expect(await screen.findByRole("heading", { name: "¿Qué papel vas a fotografiar?" })).toBeInTheDocument();
});

test("a wrong code shows the server's message, and a short one is caught before sending", async () => {
  const user = userEvent.setup();
  axiosInstance.post.mockRejectedValue(
    Object.assign(new Error("not found"), { response: { status: 404, data: { message: "Ese código no sirve." } } })
  );
  open("/movil");
  await user.type(screen.getByLabelText("Código"), "123");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  expect(screen.getByRole("alert")).toHaveTextContent("El código tiene 6 números");
  expect(axiosInstance.post).not.toHaveBeenCalled();

  await user.type(screen.getByLabelText("Código"), "456");
  await user.click(screen.getByRole("button", { name: "Continuar" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Ese código no sirve.");
});

test("the phone page never asks for the person's record", async () => {
  axiosInstance.get.mockResolvedValue({ data: { caduca: new Date().toISOString() } });
  open(`/movil/${TOKEN}`);
  await screen.findByRole("heading", { name: "¿Qué papel vas a fotografiar?" });
  expect(axiosInstance.get.mock.calls.map(([path]) => path)).toEqual([`/movil/sesion/${TOKEN}`]);
});
