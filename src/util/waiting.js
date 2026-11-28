// How long a pending application has waited for review. It waits from when it was sent
// (fechaEnvio); records sent before fechaEnvio existed wait from fechaCreacion. Same rule as
// the back end's review queue (ruidea-backend functions/queue.js).
const DAY_MS = 24 * 60 * 60 * 1000;

export const waitingSince = (item) => {
  const at = Date.parse(item && (item.fechaEnvio || item.fechaCreacion));
  return Number.isNaN(at) ? null : at;
};

export const daysWaiting = (item, now = Date.now()) => {
  const since = waitingSince(item);
  return since == null ? null : Math.max(0, Math.floor((now - since) / DAY_MS));
};

export const diasLabel = (days) => (days === 1 ? "1 día" : `${days} días`);

export const esperandoLabel = (days) => (days === 0 ? "Esperando desde hoy" : `Esperando ${diasLabel(days)}`);
