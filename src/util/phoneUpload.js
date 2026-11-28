import { axiosInstance } from "../axios";

// "Hazles una foto con el móvil" (routes/movil.js in ruidea-backend). The computer asks for a
// 15-minute link and lists the photos that arrived; the phone sends them with the link token.

export const GROUPS = ["diagnostico", "documento"];
export const POLL_MS = 4000;

// The address typed on the phone when the QR cannot be scanned.
export const phoneAddress = () => `${window.location.host}/movil`;
export const phoneLink = (token) => `${window.location.origin}/movil/${token}`;

// { token, codigo, caduca }
export const createPhoneLink = async () => (await axiosInstance.post("/movil/token")).data;

// { archivos: [{ id, grupo, orden, creado, tipo, tamano, url }], movilConectado }
export const listStaged = async () => (await axiosInstance.get("/movil/archivos")).data;

export const deleteStaged = (id) => axiosInstance.delete(`/movil/archivos/${id}`);

// The phone side, without a session: { caduca }, or a 410 when the link has expired.
export const phoneSession = async (token) => (await axiosInstance.get(`/movil/sesion/${token}`)).data;

// The 6-digit code typed on the phone -> { token }.
export const exchangeCode = async (codigo) => (await axiosInstance.post("/movil/codigo", { codigo })).data;

export const sendPhonePhoto = async (token, grupo, file) => {
  const fd = new FormData();
  fd.append("grupo", grupo);
  fd.append("foto", file);
  return (await axiosInstance.post(`/movil/sesion/${token}/fotos`, fd)).data;
};

export const isExpired = (err) => Boolean(err && err.response && err.response.status === 410);

// A photo from the phone, shaped like a picked File where the uploader reads one.
export const stagedEntry = (archivo) => ({
  movil: true,
  id: archivo.id,
  name: `Foto del móvil ${archivo.orden}`,
  type: archivo.tipo,
  size: archivo.tamano,
  url: archivo.url,
});

// The lists with the server's staged photos merged in: new ones go at the end of their group,
// ones the server no longer has (joined or deleted) leave, the rest keep the place the person
// gave them. `ignored` holds ids being deleted. With `refresh`, the kept ones take the new
// thumbnail links (each lasts 10 minutes). Returns `files` itself when nothing changed.
export const mergeStaged = (files, archivos, { ignored = new Set(), refresh = false } = {}) => {
  let changed = refresh;
  const next = {};
  GROUPS.forEach((grupo) => {
    const current = files[grupo] || [];
    const server = archivos.filter((a) => a.grupo === grupo && !ignored.has(a.id));
    const byId = new Map(server.map((a) => [a.id, a]));
    const kept = current
      .filter((f) => !f.movil || byId.has(f.id))
      .map((f) => (refresh && f.movil ? stagedEntry(byId.get(f.id)) : f));
    const present = new Set(kept.filter((f) => f.movil).map((f) => f.id));
    const added = server.filter((a) => !present.has(a.id)).map(stagedEntry);
    if (kept.length !== current.length || added.length) changed = true;
    next[grupo] = [...kept, ...added];
  });
  return changed ? { ...files, ...next } : files;
};
