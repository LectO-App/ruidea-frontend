import React from "react";
import { TextEncoder } from "util";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import QRCode from "qrcode";

import PhoneUploadCard from "./PhoneUploadCard";
import { axiosInstance } from "../../axios";

// jsdom has no TextEncoder; qrcode needs it to encode the link.
global.TextEncoder = TextEncoder;

jest.mock("../../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn(), delete: jest.fn() } }));

// Synthetic values only.
const TOKEN = "T".repeat(43);
const link = (minutes = 15, token = TOKEN, codigo = "482913") => ({
  data: { token, codigo, caduca: new Date(Date.now() + minutes * 60000).toISOString() },
});
const staged = (id, grupo) => ({ id, grupo, orden: 1, tipo: "image/jpeg", tamano: 1000, url: `https://storage.test/${id}` });
const listing = (archivos, movilConectado = false) => ({ data: { archivos, movilConectado } });

beforeEach(() => {
  jest.spyOn(QRCode, "toString");
  axiosInstance.post.mockReset();
  axiosInstance.get.mockReset();
});
afterEach(() => QRCode.toString.mockRestore());

test("the card shows the QR, the address to type, the 6-digit code and when it expires", async () => {
  axiosInstance.post.mockResolvedValue(link(15));
  axiosInstance.get.mockResolvedValue(listing([]));
  render(<PhoneUploadCard onStaged={jest.fn()} />);

  expect(screen.getByRole("heading", { name: /Hazles una foto con el móvil/ })).toBeInTheDocument();
  expect(await screen.findByText("482 913")).toBeInTheDocument();
  expect(screen.getByText(`${window.location.host}/movil`)).toBeInTheDocument();
  expect(screen.getByText("El código caduca en 15 minutos.")).toBeInTheDocument();
  expect(await screen.findByRole("img", { name: /Código QR/ })).toBeInTheDocument();
  expect(QRCode.toString.mock.calls[0][0]).toBe(`${window.location.origin}/movil/${TOKEN}`);
  expect(axiosInstance.post).toHaveBeenCalledWith("/movil/token");
});

test("an expired code offers a new one", async () => {
  const user = userEvent.setup();
  axiosInstance.post.mockResolvedValueOnce(link(-1)).mockResolvedValueOnce(link(15, "N".repeat(43), "100200"));
  axiosInstance.get.mockResolvedValue(listing([]));
  render(<PhoneUploadCard onStaged={jest.fn()} />);

  await user.click(await screen.findByRole("button", { name: "Crear un código nuevo" }));
  expect(await screen.findByText("100 200")).toBeInTheDocument();
  expect(axiosInstance.post).toHaveBeenCalledTimes(2);
});

test("it checks for phone photos while open, and says when the phone connects and a photo arrives", async () => {
  axiosInstance.post.mockResolvedValue(link(15));
  axiosInstance.get
    .mockResolvedValueOnce(listing([staged("a", "documento")]))
    .mockResolvedValueOnce(listing([staged("a", "documento")], true))
    .mockResolvedValue(listing([staged("a", "documento"), staged("b", "diagnostico")], true));
  const onStaged = jest.fn();
  render(<PhoneUploadCard onStaged={onStaged} pollMs={20} />);

  // The first answer: photos sent before a reload, not announced, with fresh thumbnail links.
  await waitFor(() => expect(onStaged).toHaveBeenCalledWith([staged("a", "documento")], { refresh: true }));
  expect(await screen.findByText("Móvil conectado. Las fotos aparecen aquí solas.")).toBeInTheDocument();
  expect(await screen.findByText("Ha llegado una foto del móvil: Informe de diagnóstico.")).toBeInTheDocument();
  expect(onStaged).toHaveBeenLastCalledWith([staged("a", "documento"), staged("b", "diagnostico")], { refresh: false });
  expect(axiosInstance.get).toHaveBeenCalledWith("/movil/archivos");
});

test("when no code can be made, it says so and the uploader below still works", async () => {
  axiosInstance.post.mockRejectedValue(new Error("offline"));
  axiosInstance.get.mockRejectedValue(new Error("offline"));
  render(<PhoneUploadCard onStaged={jest.fn()} />);
  expect(await screen.findByText(/Puedes elegir los archivos aquí abajo/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Intentarlo otra vez" })).toBeInTheDocument();
});
