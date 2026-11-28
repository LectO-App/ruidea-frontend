import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Switch } from "react-router-dom";

import { ProtectedRoute } from "./protected.route";
import { axiosInstance } from "./axios";

jest.mock("./axios", () => ({ axiosInstance: { get: jest.fn() } }));

const COPY = JSON.stringify({ numeroPasaporte: "0001042", url: "x", guardadoEn: "2026-11-20T09:30:00Z" });

const renderAt = (path, checkUrl) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Switch>
        <ProtectedRoute path="/dashboard" component={() => "Panel"} checkUrl={checkUrl} />
        <ProtectedRoute path="/mostrar" component={() => "Mostrar"} />
        <Route exact path="/">Inicio</Route>
      </Switch>
    </MemoryRouter>
  );

afterEach(() => {
  window.localStorage.clear();
  axiosInstance.get.mockReset();
});

test("offline with a saved passport, the dashboard opens Mostrar", async () => {
  window.localStorage.setItem("ruidea-pasaporte", COPY);
  axiosInstance.get.mockRejectedValue(new Error("Network Error"));
  renderAt("/dashboard");
  expect(await screen.findByText("Mostrar")).toBeInTheDocument();
});

test("offline with a saved passport, Mostrar itself renders", async () => {
  window.localStorage.setItem("ruidea-pasaporte", COPY);
  axiosInstance.get.mockRejectedValue(new Error("Network Error"));
  renderAt("/mostrar");
  expect(await screen.findByText("Mostrar")).toBeInTheDocument();
});

test("offline with no copy, it sends the visitor to the start as before", async () => {
  axiosInstance.get.mockRejectedValue(new Error("Network Error"));
  renderAt("/dashboard");
  expect(await screen.findByText("Inicio")).toBeInTheDocument();
});

test("a 401 while online is not treated as offline", async () => {
  window.localStorage.setItem("ruidea-pasaporte", COPY);
  axiosInstance.get.mockRejectedValue(Object.assign(new Error("401"), { response: { status: 401 } }));
  renderAt("/dashboard");
  expect(await screen.findByText("Inicio")).toBeInTheDocument();
});

test("admin routes never fall back to the passport copy", async () => {
  window.localStorage.setItem("ruidea-pasaporte", COPY);
  axiosInstance.get.mockRejectedValue(new Error("Network Error"));
  renderAt("/dashboard", "/admin/me");
  expect(await screen.findByText("Inicio")).toBeInTheDocument();
});
