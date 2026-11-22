import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AdminEstadisticas from "./AdminEstadisticas";
import { axiosInstance } from "../../axios";

jest.mock("../../axios", () => ({ axiosInstance: { get: jest.fn(), post: jest.fn() } }));

// The shape GET /admin/estadisticas answers (ruidea-backend functions/stats.js). Synthetic.
const STATS = {
  rango: { desde: null, hasta: null },
  registro: {
    totales: { borradores: 12, enviadas: 11, aceptadas: 6, rechazadas: 1 },
    porMes: [{ mes: "2026-10", borradores: 12, enviadas: 11, aceptadas: 6, rechazadas: 1 }],
  },
  revision: { medianaDias: 3.3, p90Dias: 11, decisiones: 7, pendientes: 4 },
  escaneos: {
    total: 16,
    porTipo: { qr: 9, enlace: 4, verificador: 6 },
    porSemana: [
      { semana: "2026-10-05", qr: 9, enlace: 3, verificador: 2, exitosos: 12, fallidos: 2 },
      { semana: "2026-10-12", qr: 0, enlace: 1, verificador: 4, exitosos: 4, fallidos: 1 },
    ],
    fallosPorSemana: [{ semana: "2026-10-05", not_found: 0, document_mismatch: 2, denied: 0, legacy_disabled: 0 }],
    porMes: [{ mes: "2026-10", n: 16 }],
    porPais: [
      { pais: "AR", n: 9 },
      { pais: "ES", n: 5 },
      { pais: "Otros", n: 2 },
    ],
    porDispositivo: [{ dispositivo: "mobile", n: 16 }],
    cuotaEnlaceAntiguo: 0.25,
  },
  pasaportes: {
    aceptados: 19,
    activos: 12,
    cuotaActivos: 0.632,
    distribucionEscaneos: [
      { tramo: "0", n: 7 },
      { tramo: "1", n: 12 },
    ],
    medianaDiasHastaPrimerEscaneo: 4.4,
  },
  titulares: {
    total: 19,
    porPais: [{ pais: "Argentina", n: 19 }],
    diagnostico: [{ diagnostico: "dislexia", n: 15 }],
    tutor: 12,
    cuotaTutor: 0.632,
  },
  verificadores: [{ nombre: "Colegio Ejemplo", activo: true, consultas: 6, ultimoUso: "2026-10-14T10:00:00.000Z" }],
  curiosidades: {
    paisesConEscaneos: 4,
    diaMasActivo: { dia: "2026-10-06", n: 7 },
    verificadorDelMes: { nombre: "Colegio Ejemplo", consultas: 6 },
    maxPaisesUnPasaporte: 3,
  },
};
const EMPTY = {
  ...STATS,
  registro: { totales: { borradores: 0, enviadas: 0, aceptadas: 0, rechazadas: 0 }, porMes: [] },
  escaneos: { ...STATS.escaneos, total: 0, porSemana: [], porPais: [] },
  pasaportes: { ...STATS.pasaportes, aceptados: 0 },
};

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/admin/estadisticas"]}>
      <AdminEstadisticas history={{ push: jest.fn() }} />
    </MemoryRouter>
  );

beforeEach(() => axiosInstance.get.mockReset());

test("shows the totals, the country table and the weekly chart", async () => {
  axiosInstance.get.mockResolvedValue({ data: STATS });
  renderPage();
  expect(await screen.findByText("Verificaciones correctas")).toBeInTheDocument();
  expect(axiosInstance.get).toHaveBeenCalledWith("/admin/estadisticas", { params: {} });
  expect(screen.getByText("63 %")).toBeInTheDocument();
  const paises = screen.getByRole("table", { name: "Verificaciones correctas por país" });
  expect(within(paises).getByRole("rowheader", { name: "Argentina" })).toBeInTheDocument();
  expect(within(paises).getByRole("rowheader", { name: "Otros países" })).toBeInTheDocument();
  const week = screen.getAllByRole("img", { name: /Semana del/ })[0];
  screen.getByRole("button", { name: "Aplicar fechas" }).focus();
  await userEvent.tab();
  expect(week).toHaveFocus();
  expect(screen.getByText(/Semana del 5 oct 2026: Código QR o enlace 9, Enlace antiguo 3, Verificador 2/, { selector: "p" })).toBeInTheDocument();
  expect(screen.getByRole("table", { name: "Verificadores ordenados por número de consultas" })).toHaveTextContent("Colegio Ejemplo");
  expect(screen.getByRole("link", { name: "Estadísticas" })).toHaveAttribute("aria-current", "page");
});

test("the date filter sends desde and hasta, and rejects a reversed range", async () => {
  axiosInstance.get.mockResolvedValue({ data: STATS });
  renderPage();
  await screen.findByText("Verificaciones correctas");
  const [desde, hasta] = [screen.getByLabelText("Desde"), screen.getByLabelText("Hasta")];
  await userEvent.type(desde, "2026-10-31");
  await userEvent.type(hasta, "2026-10-01");
  await userEvent.click(screen.getByRole("button", { name: "Aplicar fechas" }));
  expect(screen.getByRole("alert")).toHaveTextContent("La fecha de inicio tiene que ser anterior a la de fin.");
  expect(axiosInstance.get).toHaveBeenCalledTimes(1);

  await userEvent.clear(desde);
  await userEvent.type(desde, "2026-09-01");
  await userEvent.click(screen.getByRole("button", { name: "Aplicar fechas" }));
  await waitFor(() =>
    expect(axiosInstance.get).toHaveBeenLastCalledWith("/admin/estadisticas", {
      params: { desde: "2026-09-01", hasta: "2026-10-01" },
    })
  );
  await userEvent.click(await screen.findByRole("button", { name: "Ver todo el periodo" }));
  await waitFor(() => expect(axiosInstance.get).toHaveBeenLastCalledWith("/admin/estadisticas", { params: {} }));
});

test("a failed request shows a readable message and can be retried", async () => {
  axiosInstance.get.mockRejectedValueOnce(new Error("Network Error")).mockResolvedValueOnce({ data: EMPTY });
  renderPage();
  expect(await screen.findByText("No se pudieron cargar las estadísticas")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
  expect(await screen.findByText("Todavía no hay datos en este periodo")).toBeInTheDocument();
});
