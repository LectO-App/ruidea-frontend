import React, { useState, useEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { axiosInstance } from "../../axios";

import AdminAuth from "./adminAuth";
import AdminNavbar from "./AdminNavbar";
import StatusBadge, { statusKey } from "./StatusBadge";
import { toast } from "../ui/toast";
import InlineMessage from "../ui/InlineMessage";

const FILTERS = [
  { value: "pendiente", label: "Pendientes" },
  { value: "revision", label: "En revisión" },
  { value: "aceptado", label: "Aceptados" },
  { value: "rechazado", label: "Rechazados" },
  { value: "borrador", label: "Sin terminar" },
  { value: "", label: "Todas" },
];

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const calculateAge = (date) => {
  const today = new Date();
  const birth = new Date(date);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const AdminSolicitudes = (props) => {
  const [condicion, setCondicion] = useState("pendiente");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [exporting, setExporting] = useState(false);
  // Default to most-recent-first — the useful order for triage.
  const [sort, setSort] = useState({ key: "fecha", dir: "desc" });

  const fetchFromAPI = useCallback(async (cond) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post("/admin/solicitudes", { condicion: cond });
      setData(res.data);
    } catch (err) {
      setError("No se pudieron cargar las solicitudes.");
    } finally {
      setLoading(false);
    }
  }, []);

  // The route is server-protected (ProtectedRoute -> /admin/me); no client-side gate.
  useEffect(() => {
    fetchFromAPI(condicion);
  }, [fetchFromAPI, condicion]);

  const cerrarSesion = () =>
    AdminAuth.logout(() => props.history.push("/admin"));

  const toggleSort = (key) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "nombre" ? "asc" : "desc" }
    );

  // Inline search (name, surname, document or email) + sort, all derived from `data`.
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = data;
    if (q) {
      list = data.filter((el) =>
        [el.nombre, el.apellidos, el.numeroDocumento, el.numeroPasaporte, el.correoElectronico]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      if (sort.key === "nombre") {
        return `${a.nombre} ${a.apellidos}`.localeCompare(`${b.nombre} ${b.apellidos}`, "es") * dir;
      }
      return (new Date(a.fechaCreacion) - new Date(b.fechaCreacion)) * dir;
    });
  }, [data, query, sort]);

  const downloadExcel = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await axiosInstance.get("/admin/excel", { responseType: "blob" });
      const url = window.URL.createObjectURL(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Usuarios.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("No se pudo descargar la planilla.");
    } finally {
      setExporting(false);
    }
  };

  const resendEmail = async (id) => {
    try {
      await axiosInstance.post(`/admin/resend/${id}`);
      toast.success("Mail de verificación reenviado");
    } catch (err) {
      toast.error("No se pudo reenviar el mail.");
    }
  };

  const openSolicitud = (id) => props.history.push(`/admin/solicitudes/${id}`);

  // Always render an arrow so the header doesn't shift when a column becomes active:
  // a faint up-down glyph reserves the slot, the active column shows the real direction.
  const SortArrow = ({ col }) => {
    const active = sort.key === col;
    return (
      <span className={`adm-th-arrow${active ? " is-active" : ""}`} aria-hidden="true">
        {active ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}
      </span>
    );
  };

  const renderAction = (item) => {
    // Unfinished sign-ups (draft): there's no complete solicitud to open, so the useful
    // action is to nudge the person by resending the confirmation email. Many of these
    // users have dyslexia and get stuck on the email step — one clear button helps.
    if (item.estado === "borrador") {
      return (
        <button className="adm-btn adm-btn--primary" onClick={() => resendEmail(item._id)}>
          Reenviar correo
        </button>
      );
    }
    if (item.emailVerificado === false) {
      return (
        <button className="adm-btn adm-btn--ghost" onClick={() => resendEmail(item._id)}>
          Reenviar verificación
        </button>
      );
    }
    const primary = item.estado === "pendiente";
    return (
      <button
        className={`adm-btn ${primary ? "adm-btn--primary" : "adm-btn--ghost"}`}
        onClick={() => openSolicitud(item._id)}
      >
        {primary ? "Revisar" : "Ver"}
      </button>
    );
  };

  return (
    <div className="adm">
      <AdminNavbar cerrarSesion={cerrarSesion} />
      <main className="adm-main">
        <header className="adm-head">
          <div>
            <h1 className="adm-title">Solicitudes</h1>
            <p className="adm-subtitle">Revisa y gestiona las solicitudes de pasaporte DEA.</p>
          </div>
          <button
            className="adm-btn adm-btn--ghost adm-btn--lead"
            onClick={downloadExcel}
            disabled={exporting}
          >
            <DownloadIcon /> {exporting ? "Descargando…" : "Descargar Excel"}
          </button>
        </header>

        <div className="adm-toolbar">
          <div className="adm-tabs" role="tablist" aria-label="Filtrar por estado">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={condicion === f.value}
                className={`adm-tab${condicion === f.value ? " is-active" : ""}`}
                onClick={() => setCondicion(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="adm-search">
            <SearchIcon />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre, documento o correo"
              aria-label="Buscar solicitudes"
            />
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={condicion || "todas"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            {loading ? (
              <SkeletonTable />
            ) : error ? (
              <InlineMessage type="error">
                {error}{" "}
                <button className="adm-link" onClick={() => fetchFromAPI(condicion)}>
                  Reintentar
                </button>
              </InlineMessage>
            ) : rows.length === 0 ? (
              <EmptyState query={query} />
            ) : (
              <>
            <p className="adm-count">
              {rows.length} {rows.length === 1 ? "solicitud" : "solicitudes"}
              {query && " encontradas"}
            </p>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>
                      <button
                        className="adm-th-sort"
                        onClick={() => toggleSort("nombre")}
                        aria-label={`Ordenar por solicitante${
                          sort.key === "nombre" ? (sort.dir === "asc" ? ", ascendente" : ", descendente") : ""
                        }`}
                      >
                        Solicitante <SortArrow col="nombre" />
                      </button>
                    </th>
                    <th>Documento</th>
                    <th>
                      <button
                        className="adm-th-sort"
                        onClick={() => toggleSort("fecha")}
                        aria-label={`Ordenar por fecha de creación${
                          sort.key === "fecha" ? (sort.dir === "asc" ? ", ascendente" : ", descendente") : ""
                        }`}
                      >
                        Creación <SortArrow col="fecha" />
                      </button>
                    </th>
                    <th>Nacimiento</th>
                    <th>Estado</th>
                    <th className="adm-th-action">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => {
                    // Drafts have no complete solicitud to open, so the row isn't a nav
                    // target — only its "Reenviar correo" action is interactive.
                    const draft = item.estado === "borrador";
                    const nombreCompleto = `${item.nombre || ""} ${item.apellidos || ""}`.trim();
                    const navProps = draft
                      ? {}
                      : {
                          role: "button",
                          tabIndex: 0,
                          "aria-label": `Ver solicitud de ${nombreCompleto}`,
                          onClick: () => openSolicitud(item._id),
                          onKeyDown: (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openSolicitud(item._id);
                            }
                          },
                        };
                    return (
                    <tr
                      key={item._id}
                      className={`adm-row${draft ? " adm-row--static" : ""}`}
                      {...navProps}
                    >
                      <td data-label="Solicitante">
                        <span className="adm-person">
                          <span className="adm-person__name">
                            {nombreCompleto || "Sin nombre todavía"}
                          </span>
                          <span className="adm-person__mail">{item.correoElectronico}</span>
                        </span>
                      </td>
                      <td data-label="Documento" className="adm-mono">
                        {statusKey(item) === "aceptado" && item.numeroPasaporte
                          ? `Nº ${item.numeroPasaporte}`
                          : item.numeroDocumento || "—"}
                      </td>
                      <td data-label="Creación">{fmtDate(item.fechaCreacion)}</td>
                      <td data-label="Nacimiento">
                        {fmtDate(item.fechaNacimiento)}
                        {item.fechaNacimiento && (
                          <span className="adm-age"> · {calculateAge(item.fechaNacimiento)} años</span>
                        )}
                      </td>
                      <td data-label="Estado">
                        <StatusBadge item={item} />
                      </td>
                      <td className="adm-td-action" onClick={(e) => e.stopPropagation()}>
                        {renderAction(item)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const SkeletonTable = () => (
  <div aria-hidden="true">
    {/* Mirror the loaded view's count line + header row so the table doesn't jump. */}
    <p className="adm-count">
      <span className="adm-skel adm-skel--count" />
    </p>
    <div className="adm-table-wrap">
      <table className="adm-table adm-table--skeleton">
        <thead>
          <tr>
            <th>Solicitante</th>
            <th>Documento</th>
            <th>Creación</th>
            <th>Nacimiento</th>
            <th>Estado</th>
            <th className="adm-th-action">Acción</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 6 }).map((__, j) => (
                <td key={j}>
                  <span className="adm-skel" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const EmptyState = ({ query }) => (
  <div className="adm-empty">
    <div className="adm-empty__icon" aria-hidden="true">
      <InboxIcon />
    </div>
    <h2>{query ? "Sin coincidencias" : "No hay solicitudes en este estado"}</h2>
    <p>
      {query
        ? "Prueba con otro nombre, documento o correo."
        : "Cuando lleguen nuevas solicitudes aparecerán aquí."}
    </p>
  </div>
);

/* ---- inline icons ---- */
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 13h4l2 3h6l2-3h4M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
  </svg>
);

export default AdminSolicitudes;
