import React from "react";
import { render, act } from "@testing-library/react";
import { MemoryRouter, useHistory } from "react-router-dom";
import { loadBeacon, BeaconRouteGuard } from "./analytics";

const TOKEN = "synthetic-beacon-token";
const beacon = () => document.querySelector("script[data-cf-beacon]");
const setReferrer = (value) => Object.defineProperty(document, "referrer", { value, configurable: true });

const visit = (path, referrer = "") => {
  window.history.pushState({}, "", path);
  setReferrer(referrer);
};

afterEach(() => {
  document.querySelectorAll("script[data-cf-beacon]").forEach((s) => s.remove());
  visit("/");
});

test("nothing loads without a beacon token", () => {
  visit("/");
  loadBeacon(undefined);
  expect(beacon()).toBeNull();
});

test("an ordinary page loads the beacon once, in SPA mode", () => {
  visit("/dashboard");
  loadBeacon(TOKEN);
  loadBeacon(TOKEN);
  expect(document.querySelectorAll("script[data-cf-beacon]")).toHaveLength(1);
  expect(beacon().src).toBe("https://static.cloudflareinsights.com/beacon.min.js");
  expect(JSON.parse(beacon().getAttribute("data-cf-beacon"))).toEqual({ token: TOKEN, spa: true });
});

test.each([
  "/cambiarContraseña/secret-reset-token",
  "/verificarEmail/secret-email-token",
  "/verificar/12345678Z/0001234",
  "/verificar/TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT0",
])("the beacon never loads on %s", (path) => {
  visit(path);
  loadBeacon(TOKEN);
  expect(beacon()).toBeNull();
});

test("the beacon does not load when a token page linked here (it would send it as referrer)", () => {
  visit("/login", `${window.location.origin}/verificarEmail/secret-email-token`);
  loadBeacon(TOKEN);
  expect(beacon()).toBeNull();
  visit("/login", "https://example.test/verificar/whatever");
  loadBeacon(TOKEN);
  expect(beacon()).not.toBeNull();
});

const renderGuard = (navigate) => {
  let history;
  const Capture = () => {
    history = useHistory();
    return null;
  };
  render(
    <MemoryRouter initialEntries={["/"]}>
      <BeaconRouteGuard navigate={navigate} />
      <Capture />
    </MemoryRouter>
  );
  return () => history;
};

test("with the beacon loaded, going to a token page is a full page load, not a history change", () => {
  visit("/");
  loadBeacon(TOKEN);
  const navigate = jest.fn();
  const history = renderGuard(navigate);
  act(() => history().push("/verificar/TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT0"));
  expect(navigate).toHaveBeenCalledWith("/verificar/TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT0");
  expect(history().location.pathname).toBe("/");
  act(() => history().push("/dashboard"));
  expect(history().location.pathname).toBe("/dashboard");
  expect(navigate).toHaveBeenCalledTimes(1);
});

test("without the beacon, in-app navigation is untouched", () => {
  const navigate = jest.fn();
  const history = renderGuard(navigate);
  act(() => history().push("/verificar/TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT0"));
  expect(navigate).not.toHaveBeenCalled();
  expect(history().location.pathname).toBe("/verificar/TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT0");
});
