// Reasons a specialist can give when returning an application for revision. The back end
// owns the list (ruidea-backend validation/motivosRevision.js: ids, groups and titles must
// match); this map adds what the applicant reads: a plain tip and the action that opens the
// form step (grupo) to fix it.
export const GRUPOS = [
  { key: "datos", label: "Datos personales" },
  { key: "residencia", label: "Residencia y documento" },
  { key: "diagnostico", label: "Diagnóstico" },
  { key: "documentos", label: "Documentos" },
];

export const MOTIVOS = [
  {
    id: "informe-ilegible",
    grupo: "documentos",
    titulo: "El informe no se lee bien",
    consejo: "Haz la foto con buena luz y con la hoja entera, sin sombras.",
    accion: "Cambiar el informe",
  },
  {
    id: "informe-incompleto",
    grupo: "documentos",
    titulo: "Falta una parte del informe",
    consejo: "Sube todas las páginas del informe, también la de la firma.",
    accion: "Cambiar el informe",
  },
  {
    id: "documento-identidad",
    grupo: "documentos",
    titulo: "No se ve bien tu documento de identidad",
    consejo: "Haz una foto de cada cara, sin reflejos y con todos los datos a la vista.",
    accion: "Cambiar el documento",
  },
  {
    id: "diagnostico-no-coincide",
    grupo: "diagnostico",
    titulo: "El diagnóstico no coincide con el informe",
    consejo: "Marca solo los diagnósticos que aparecen escritos en el informe.",
    accion: "Cambiar el diagnóstico",
  },
  {
    id: "nombre-no-coincide",
    grupo: "datos",
    titulo: "El nombre no coincide con el documento",
    consejo: "Escribe el nombre y los apellidos igual que en el documento de identidad.",
    accion: "Cambiar el nombre",
  },
  {
    id: "fecha-nacimiento",
    grupo: "datos",
    titulo: "Revisa la fecha de nacimiento",
    consejo: "Mira la fecha en el documento de identidad y escribe el día, el mes y el año.",
    accion: "Cambiar la fecha",
  },
  {
    id: "datos-tutor",
    grupo: "datos",
    titulo: "Faltan los datos de quien hace la solicitud",
    consejo: "Si pides el pasaporte para un menor, escribe tu nombre y tu relación con él o con ella.",
    accion: "Completar los datos",
  },
  {
    id: "numero-documento",
    grupo: "residencia",
    titulo: "El número de documento no coincide",
    consejo: "Copia el número igual que en el documento, con la letra si la tiene.",
    accion: "Cambiar el número",
  },
];

const BY_ID = new Map(MOTIVOS.map((m) => [m.id, m]));

// The catalog entries for `ids`, in the order given, skipping ids this build doesn't know.
export const motivosFor = (ids) => (ids || []).map((id) => BY_ID.get(id)).filter(Boolean);

export const grupoLabel = (key) => (GRUPOS.find((g) => g.key === key) || { label: key }).label;

// The form URL that opens only the step of `grupo` and returns to the dashboard.
export const pasoUrl = (grupo) => `/inscribirse?paso=${grupo}&volver=panel`;
