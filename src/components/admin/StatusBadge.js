import React from "react";

// Status with colour + label (never colour alone). `emailVerificado === false` takes
// precedence over the stored estado, matching the list/detail action logic.
const STATUS = {
  pendiente: { label: "Pendiente", cls: "is-pending" },
  aceptado: { label: "Aceptado", cls: "is-ok" },
  rechazado: { label: "Rechazado", cls: "is-rejected" },
  revision: { label: "En revisión", cls: "is-review" },
  sin_email: { label: "Email sin verificar", cls: "is-muted" },
};

export const statusKey = (item) =>
  item && item.emailVerificado === false ? "sin_email" : item?.estado || "pendiente";

const StatusBadge = ({ item, status }) => {
  const key = status || statusKey(item);
  const s = STATUS[key] || STATUS.pendiente;
  return (
    <span className={`adm-badge ${s.cls}`}>
      <span className="adm-badge__dot" aria-hidden="true" />
      {s.label}
    </span>
  );
};

export default StatusBadge;
