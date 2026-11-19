import React, { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "../../axios";

import AdminAuth from "./adminAuth";
import AdminNavbar from "./AdminNavbar";
import InlineMessage from "../ui/InlineMessage";

// Usage statistics from GET /admin/estadisticas: aggregates only (the back end merges any
// bucket under 5 into "Otros" and never returns a passport, a name or a per-passport place).

const nf = new Intl.NumberFormat("es-ES");
const fmt = (n) => (n == null ? "—" : nf.format(n));
const pct = (share) => (share == null ? "—" : `${Math.round(share * 100)} %`);
const days = (d) => (d == null ? "—" : `${String(d).replace(".", ",")} ${d === 1 ? "día" : "días"}`);
const fmtDay = (iso) =>
  iso ? new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtMonth = (mes) =>
  new Date(`${mes}-15T12:00:00Z`).toLocaleDateString("es-ES", { month: "short", year: "numeric" });

let regionNames = null;
try {
  regionNames = new Intl.DisplayNames(["es"], { type: "region" });
} catch {
  regionNames = null;
}
const countryName = (code) => {
  if (code === "Otros" || code === "Desconocido") return code === "Otros" ? "Otros países" : "Sin dato";
  if (code === "T1") return "Red Tor";
  try {
    return (regionNames && regionNames.of(code)) || code;
  } catch {
    return code;
  }
};

const DIAGNOSIS = {
  dislexia: "Dislexia",
  discalculia: "Discalculia",
  disortografia: "Disortografía",
  dispraxia: "Dispraxia",
  tdah: "TDAH",
  Otros: "Otros diagnósticos",
};
const DEVICE = { mobile: "Móvil o tableta", desktop: "Ordenador", other: "Otro", Otros: "Otros" };
const TRAMO = { 0: "Ninguno", 1: "1", "2-5": "De 2 a 5", "6-20": "De 6 a 20", "21+": "Más de 20", Otros: "Otros" };
const FAILURE = {
  not_found: "No encontrado",
  document_mismatch: "Documento no coincide",
  denied: "Credencial incorrecta",
  legacy_disabled: "Enlace antiguo retirado",
};
const KINDS = [
  { key: "qr", label: "Código QR o enlace", color: "#2a78d6" },
  { key: "enlace", label: "Enlace antiguo", color: "#eb6834" },
  { key: "verificador", label: "Verificador", color: "#1baf7a" },
];

const isEmpty = (s) =>
  s.escaneos.total === 0 &&
  s.registro.totales.borradores === 0 &&
  s.registro.totales.enviadas === 0 &&
  s.pasaportes.aceptados === 0;

const AdminEstadisticas = (props) => {
  const [range, setRange] = useState({ desde: "", hasta: "" });
  const [draft, setDraft] = useState({ desde: "", hasta: "" });
  const [rangeError, setRangeError] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (r) => {
    setLoading(true);
    setError(false);
    try {
      const params = {};
      if (r.desde) params.desde = r.desde;
      if (r.hasta) params.hasta = r.hasta;
      const res = await axiosInstance.get("/admin/estadisticas", { params });
      setStats(res.data);
    } catch {
      setStats(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(range);
  }, [load, range]);

  const apply = (e) => {
    e.preventDefault();
    if (draft.desde && draft.hasta && draft.desde > draft.hasta) {
      setRangeError("La fecha de inicio tiene que ser anterior a la de fin.");
      return;
    }
    setRangeError("");
    setRange({ ...draft });
  };
  const clear = () => {
    setRangeError("");
    setDraft({ desde: "", hasta: "" });
    setRange({ desde: "", hasta: "" });
  };

  const cerrarSesion = () => AdminAuth.logout(() => props.history.push("/admin"));

  return (
    <div className="adm">
      <AdminNavbar cerrarSesion={cerrarSesion} />
      <main className="adm-main adm-stats">
        <header className="adm-head">
          <div>
            <h1 className="adm-title">Estadísticas</h1>
            <p className="adm-subtitle">
              Cómo se usa el Pasaporte DEA. Solo totales: ningún dato identifica a una persona.
            </p>
          </div>
        </header>

        <form className="adm-stats__filter" onSubmit={apply} aria-label="Filtrar por fechas" noValidate>
          <label className="adm-stats__date">
            <span>Desde</span>
            <input
              type="date"
              value={draft.desde}
              onChange={(e) => setDraft((d) => ({ ...d, desde: e.target.value }))}
            />
          </label>
          <label className="adm-stats__date">
            <span>Hasta</span>
            <input
              type="date"
              value={draft.hasta}
              onChange={(e) => setDraft((d) => ({ ...d, hasta: e.target.value }))}
            />
          </label>
          <button type="submit" className="adm-btn adm-btn--primary">
            Aplicar fechas
          </button>
          {(range.desde || range.hasta) && (
            <button type="button" className="adm-btn adm-btn--ghost" onClick={clear}>
              Ver todo el periodo
            </button>
          )}
          <p className="adm-stats__range" aria-live="polite">
            {range.desde || range.hasta
              ? `Mostrando ${range.desde ? `desde el ${fmtDay(range.desde)}` : "desde el principio"} ${
                  range.hasta ? `hasta el ${fmtDay(range.hasta)}` : "hasta hoy"
                }.`
              : "Mostrando todo el periodo."}
          </p>
        </form>
        <InlineMessage type="error">{rangeError}</InlineMessage>

        {loading ? (
          <p className="adm-count" role="status">
            Calculando estadísticas…
          </p>
        ) : error ? (
          <div className="adm-empty">
            <h2>No se pudieron cargar las estadísticas</h2>
            <p>Puede que el servidor o la base de datos no estén disponibles ahora mismo.</p>
            <p className="adm-stats__retry">
              <button type="button" className="adm-btn adm-btn--ghost" onClick={() => load(range)}>
                Reintentar
              </button>
            </p>
          </div>
        ) : isEmpty(stats) ? (
          <div className="adm-empty">
            <h2>Todavía no hay datos en este periodo</h2>
            <p>Cuando haya solicitudes y verificaciones de pasaportes, aparecerán aquí.</p>
          </div>
        ) : (
          <StatsView s={stats} />
        )}
      </main>
    </div>
  );
};

const StatsView = ({ s }) => {
  const { registro, revision, escaneos, pasaportes, titulares, verificadores, curiosidades } = s;
  return (
    <>
      <section aria-labelledby="st-resumen">
        <h2 id="st-resumen" className="adm-stats__h2">
          Resumen
        </h2>
        <div className="adm-stats__tiles">
          <Tile label="Verificaciones correctas" value={fmt(escaneos.total)} />
          <Tile
            label="Pasaportes usados al menos una vez"
            value={pct(pasaportes.cuotaActivos)}
            hint={`${fmt(pasaportes.activos)} de ${fmt(pasaportes.aceptados)} pasaportes`}
          />
          <Tile label="Solicitudes por revisar" value={fmt(revision.pendientes)} hint="Ahora mismo" />
          <Tile
            label="Tiempo de revisión (mediana)"
            value={days(revision.medianaDias)}
            hint={`El 90 % se revisa en ${days(revision.p90Dias)} o menos`}
          />
          <Tile
            label="Del alta al primer uso (mediana)"
            value={days(pasaportes.medianaDiasHastaPrimerEscaneo)}
          />
          <Tile
            label="Verificaciones con enlace antiguo"
            value={pct(escaneos.cuotaEnlaceAntiguo)}
            hint="Entre las de código QR y enlace"
          />
        </div>
      </section>

      <section aria-labelledby="st-curiosidades">
        <h2 id="st-curiosidades" className="adm-stats__h2">
          Curiosidades
        </h2>
        <div className="adm-stats__tiles">
          <Tile label="Países con verificaciones" value={fmt(curiosidades.paisesConEscaneos)} />
          <Tile
            label="Día con más verificaciones"
            value={curiosidades.diaMasActivo ? fmtDay(curiosidades.diaMasActivo.dia) : "—"}
            hint={curiosidades.diaMasActivo ? `${fmt(curiosidades.diaMasActivo.n)} verificaciones` : undefined}
          />
          <Tile
            label="Verificador del mes"
            value={curiosidades.verificadorDelMes ? curiosidades.verificadorDelMes.nombre : "—"}
            hint={curiosidades.verificadorDelMes ? `${fmt(curiosidades.verificadorDelMes.consultas)} consultas este mes` : "Sin consultas este mes"}
          />
          <Tile
            label="Más países para un mismo pasaporte"
            value={fmt(curiosidades.maxPaisesUnPasaporte)}
          />
        </div>
      </section>

      <Card title="Verificaciones por semana" id="st-semana">
        <WeeklyChart weeks={escaneos.porSemana} />
      </Card>

      <div className="adm-stats__grid">
        <Card title="Del registro al pasaporte" id="st-embudo">
          <BarTable
            caption="Solicitudes en cada paso"
            head="Paso"
            rows={[
              { label: "Empezaron el registro", n: registro.totales.borradores },
              { label: "Enviaron la solicitud", n: registro.totales.enviadas },
              { label: "Aceptadas", n: registro.totales.aceptadas },
              { label: "Rechazadas", n: registro.totales.rechazadas },
            ]}
          />
        </Card>
        <Card title="Verificaciones por país" id="st-paises">
          <BarTable
            caption="Verificaciones correctas por país"
            head="País"
            rows={escaneos.porPais.map((r) => ({ label: countryName(r.pais), n: r.n }))}
            empty="Aún no hay verificaciones con país."
          />
        </Card>
        <Card title="Verificaciones por mes" id="st-mes">
          <BarTable
            caption="Verificaciones correctas por mes"
            head="Mes"
            rows={escaneos.porMes.map((r) => ({ label: fmtMonth(r.mes), n: r.n }))}
          />
        </Card>
        <Card title="Usos por pasaporte" id="st-usos">
          <BarTable
            caption="Pasaportes según cuántas veces se verificaron"
            head="Verificaciones"
            unit="pasaportes"
            rows={pasaportes.distribucionEscaneos.map((r) => ({ label: TRAMO[r.tramo] || r.tramo, n: r.n }))}
          />
        </Card>
        <Card title="Titulares por país de residencia" id="st-residencia">
          <BarTable
            caption="Pasaportes aceptados por país de residencia"
            head="País"
            unit="titulares"
            rows={titulares.porPais.map((r) => ({ label: r.pais, n: r.n }))}
          />
        </Card>
        <Card title="Diagnósticos" id="st-diagnosticos">
          <BarTable
            caption="Pasaportes aceptados por diagnóstico (una persona puede tener varios)"
            head="Diagnóstico"
            unit="titulares"
            rows={titulares.diagnostico.map((r) => ({ label: DIAGNOSIS[r.diagnostico] || r.diagnostico, n: r.n }))}
          />
          <p className="adm-stats__note">
            Gestionados por madre, padre o tutor: {fmt(titulares.tutor)} ({pct(titulares.cuotaTutor)} de{" "}
            {fmt(titulares.total)}).
          </p>
        </Card>
        <Card title="Dispositivos" id="st-dispositivos">
          <BarTable
            caption="Verificaciones correctas por tipo de dispositivo"
            head="Dispositivo"
            rows={escaneos.porDispositivo.map((r) => ({ label: DEVICE[r.dispositivo] || r.dispositivo, n: r.n }))}
          />
        </Card>
        <Card title="Registro por mes" id="st-registro-mes">
          <MonthlyFunnel months={registro.porMes} />
        </Card>
      </div>

      <Card title="Verificaciones fallidas por semana" id="st-fallos">
        {escaneos.fallosPorSemana.length === 0 ? (
          <p className="adm-muted">No hubo verificaciones fallidas en este periodo.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-stats__table">
              <caption className="adm-stats__sr">Verificaciones fallidas por semana y motivo</caption>
              <thead>
                <tr>
                  <th scope="col">Semana del</th>
                  {Object.values(FAILURE).map((label) => (
                    <th scope="col" key={label} className="adm-stats__num">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {escaneos.fallosPorSemana.map((w) => (
                  <tr key={w.semana}>
                    <th scope="row">{fmtDay(w.semana)}</th>
                    {Object.keys(FAILURE).map((k) => (
                      <td key={k} className="adm-stats__num">
                        {fmt(w[k])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="Verificadores" id="st-verificadores">
        {verificadores.length === 0 ? (
          <p className="adm-muted">No hay verificadores con clave propia.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-stats__table">
              <caption className="adm-stats__sr">Verificadores ordenados por número de consultas</caption>
              <thead>
                <tr>
                  <th scope="col">Verificador</th>
                  <th scope="col" className="adm-stats__num">
                    Consultas
                  </th>
                  <th scope="col">Último uso</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {verificadores.map((v) => (
                  <tr key={v.nombre}>
                    <th scope="row">{v.nombre}</th>
                    <td className="adm-stats__num">{fmt(v.consultas)}</td>
                    <td>{v.ultimoUso ? fmtDay(v.ultimoUso) : "Nunca"}</td>
                    <td>{v.activo ? "Activo" : "Desactivado"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
};

const Tile = ({ label, value, hint }) => (
  <div className="adm-stats__tile">
    <p className="adm-stats__tile-label">{label}</p>
    <p className="adm-stats__tile-value">{value}</p>
    {hint && <p className="adm-stats__tile-hint">{hint}</p>}
  </div>
);

const Card = ({ title, id, children }) => (
  <section className="adm-card adm-stats__card" aria-labelledby={id}>
    <h2 id={id} className="adm-stats__card-title">
      {title}
    </h2>
    {children}
  </section>
);

// A real table (readable by screen readers and keyboard), with a bar drawn in each row.
const BarTable = ({ caption, head, rows, unit = "verificaciones", empty = "Sin datos en este periodo." }) => {
  const visible = rows.filter((r) => r.n > 0);
  if (visible.length === 0) return <p className="adm-muted">{empty}</p>;
  const max = Math.max(...visible.map((r) => r.n));
  return (
    <table className="adm-stats__bars">
      <caption className="adm-stats__sr">{caption}</caption>
      <thead className="adm-stats__sr">
        <tr>
          <th scope="col">{head}</th>
          <th scope="col">Número de {unit}</th>
        </tr>
      </thead>
      <tbody>
        {visible.map((r) => (
          <tr key={r.label}>
            <th scope="row">{r.label}</th>
            <td>
              <span className="adm-stats__bar" style={{ width: `${Math.max(2, (r.n / max) * 100)}%` }} aria-hidden="true" />
              <span className="adm-stats__bar-value">{fmt(r.n)}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const MonthlyFunnel = ({ months }) =>
  months.length === 0 ? (
    <p className="adm-muted">Sin datos en este periodo.</p>
  ) : (
    <div className="adm-table-wrap">
      <table className="adm-stats__table">
        <caption className="adm-stats__sr">Registro por mes</caption>
        <thead>
          <tr>
            <th scope="col">Mes</th>
            <th scope="col" className="adm-stats__num">Empezados</th>
            <th scope="col" className="adm-stats__num">Enviados</th>
            <th scope="col" className="adm-stats__num">Aceptados</th>
            <th scope="col" className="adm-stats__num">Rechazados</th>
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.mes}>
              <th scope="row">{fmtMonth(m.mes)}</th>
              <td className="adm-stats__num">{fmt(m.borradores)}</td>
              <td className="adm-stats__num">{fmt(m.enviadas)}</td>
              <td className="adm-stats__num">{fmt(m.aceptadas)}</td>
              <td className="adm-stats__num">{fmt(m.rechazadas)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

// Stacked columns per week, one color per kind of verification. Each column is focusable and
// announces its numbers; the same numbers are in the table below the chart.
const WeeklyChart = ({ weeks }) => {
  const [active, setActive] = useState(null);
  if (weeks.length === 0) return <p className="adm-muted">Sin verificaciones en este periodo.</p>;

  const H = 180;
  const gap = 4;
  const colW = Math.max(6, Math.min(28, Math.floor(640 / weeks.length) - gap));
  const W = weeks.length * (colW + gap);
  const total = (w) => KINDS.reduce((sum, k) => sum + w[k.key], 0);
  const max = Math.max(1, ...weeks.map(total));
  const describe = (w) =>
    `Semana del ${fmtDay(w.semana)}: ${KINDS.map((k) => `${k.label} ${fmt(w[k.key])}`).join(", ")}. ${fmt(
      w.fallidos
    )} fallidas.`;
  const current = active == null ? null : weeks[active];

  return (
    <div>
      <ul className="adm-stats__legend">
        {KINDS.map((k) => (
          <li key={k.key}>
            <span className="adm-stats__swatch" style={{ background: k.color }} aria-hidden="true" />
            {k.label}
          </li>
        ))}
      </ul>
      <div className="adm-stats__chart">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height={H}
          preserveAspectRatio="none"
          role="group"
          aria-label="Verificaciones por semana, por tipo"
        >
          <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} className="adm-stats__axis" />
          {weeks.map((w, i) => {
            let y = H;
            return (
              <g
                key={w.semana}
                tabIndex={0}
                role="img"
                aria-label={describe(w)}
                className="adm-stats__col"
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              >
                <rect x={i * (colW + gap)} y="0" width={colW + gap} height={H} fill="transparent" />
                {KINDS.map((k) => {
                  const h = (w[k.key] / max) * (H - 8);
                  if (h <= 0) return null;
                  y -= h;
                  return (
                    <rect
                      key={k.key}
                      x={i * (colW + gap) + gap / 2}
                      y={y}
                      width={colW}
                      height={Math.max(0, h - 2)}
                      rx="2"
                      fill={k.color}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>
      <p className="adm-stats__tooltip" aria-hidden="true">
        {current ? describe(current) : "Pasa el ratón o usa el tabulador sobre una semana para ver sus números."}
      </p>
      <details className="adm-stats__details">
        <summary>Ver los números en una tabla</summary>
        <div className="adm-table-wrap">
          <table className="adm-stats__table">
            <caption className="adm-stats__sr">Verificaciones por semana</caption>
            <thead>
              <tr>
                <th scope="col">Semana del</th>
                {KINDS.map((k) => (
                  <th scope="col" key={k.key} className="adm-stats__num">
                    {k.label}
                  </th>
                ))}
                <th scope="col" className="adm-stats__num">Correctas</th>
                <th scope="col" className="adm-stats__num">Fallidas</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map((w) => (
                <tr key={w.semana}>
                  <th scope="row">{fmtDay(w.semana)}</th>
                  {KINDS.map((k) => (
                    <td key={k.key} className="adm-stats__num">
                      {fmt(w[k.key])}
                    </td>
                  ))}
                  <td className="adm-stats__num">{fmt(w.exitosos)}</td>
                  <td className="adm-stats__num">{fmt(w.fallidos)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
};

export default AdminEstadisticas;
