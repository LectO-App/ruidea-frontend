import { axiosInstance } from "../axios";

// One place that knows the shape of the registration backend (REGISTRATION_UX.md §8).
// Steps create a draft account, autosave per step, then submit for review — so the long
// application is resumable and nothing is lost on a refresh or an interruption (§1).

// Detect the current session: returns the user's record (which may be a `borrador`
// draft to resume, or a submitted record being edited), or null if not signed in.
export const getOwn = async () => {
  try {
    const res = await axiosInstance.get("/usuario/me");
    return res.data && res.data._id ? res.data : null;
  } catch (err) {
    return null; // no session -> a brand-new registration
  }
};

// Step 1: create the account (email + password) -> a borrador record + session. Returns
// { id }. Throws with a friendly message the caller can surface inline.
export const startDraft = async ({ correoElectronico, password }) => {
  const res = await axiosInstance.post("/inscripcion/draft", { correoElectronico, password });
  return res.data; // { id, usuario, csrfToken, siguientePaso }
};

// Autosave one step. Never throws to the UI — a failed autosave shouldn't interrupt the
// user; the data is also kept client-side and re-sent on the next step / on submit.
export const patchDraft = async (id, patch) => {
  try {
    const res = await axiosInstance.patch(`/inscripcion/${id}`, patch);
    return res.data;
  } catch (err) {
    return null;
  }
};

// Email availability + typo suggestion ("¿quisiste decir gmail.com?").
export const checkMail = async (mail) => {
  const res = await axiosInstance.post("/inscripcion/comprobar-mail", { mail });
  return res.data; // { disponible, sugerencia }
};

// Final submit of a draft -> review. Returns the completion payload (what happens next).
export const submitDraft = async (id, finalFields = {}) => {
  const res = await axiosInstance.post(`/inscripcion/${id}/enviar`, finalFields);
  return res.data; // { usuario, pasos, siguientePaso, mensaje, revisionEstimadaDias }
};

// One-shot register (no draft id) — fallback path if a draft was never created.
export const registerOneShot = async (fields) => {
  const res = await axiosInstance.post("/inscripcion", fields);
  return res.data;
};

// Editing an existing submitted record.
export const updateOwn = async (fields) => {
  const res = await axiosInstance.put("/inscripcion/actualizar", fields);
  return res.data;
};

// Upload identity/diagnosis documents (PDF or images) for the authenticated user.
// `groups` is { label: File[] }. Returns when stored. axios sets the multipart boundary
// automatically for FormData — do not set Content-Type by hand.
export const uploadFiles = async (groups) => {
  const fd = new FormData();
  Object.entries(groups).forEach(([label, files]) => {
    (files || []).forEach((file, i) => fd.append(`${label} N${i}`, file));
  });
  const res = await axiosInstance.post("/inscripcion/subir-archivos", fd);
  return res.data;
};
