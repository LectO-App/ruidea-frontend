// Reasons a specialist can give when returning an application for revision. The back end
// owns the list (ruidea-backend validation/motivosRevision.js): ids, groups, admin titles,
// titles and tips here must match it.
// - admin: what the specialist reads in the review modal.
// - titulo: what the applicant reads, an action ("Sube otra foto del informe").
// - consejo: a short tip under the title.
// - campos (front end only): the fields the single-step page shows for the reason; a reason
//   without campos shows its whole step.
export const GRUPOS = [
  { key: "datos", label: "Datos personales" },
  { key: "residencia", label: "Residencia y documento" },
  { key: "diagnostico", label: "Diagnóstico" },
  { key: "documentos", label: "Documentos" },
];

// The longest text a specialist can write for an "Otro" reason.
export const OTRO_MAX = 140;

export const MOTIVOS = [
  {
    id: "informe-ilegible",
    grupo: "documentos",
    admin: "El informe no se lee bien",
    titulo: "Sube otra foto del informe",
    consejo: "Con buena luz y la hoja entera.",
    campos: ["informe"],
  },
  {
    id: "informe-incompleto",
    grupo: "documentos",
    admin: "Falta una parte del informe",
    titulo: "Sube todas las páginas del informe",
    consejo: "También la de la firma.",
    campos: ["informe"],
  },
  {
    id: "documento-identidad",
    grupo: "documentos",
    admin: "No se ve bien tu documento de identidad",
    titulo: "Sube otra foto de tu documento",
    consejo: "Las dos caras, sin reflejos.",
    campos: ["identidad"],
  },
  {
    id: "diagnostico-no-coincide",
    grupo: "diagnostico",
    admin: "El diagnóstico no coincide con el informe",
    titulo: "Revisa el diagnóstico",
    consejo: "Marca solo lo que dice el informe.",
  },
  {
    id: "nombre-no-coincide",
    grupo: "datos",
    admin: "El nombre no coincide con el documento",
    titulo: "Escribe el nombre como en el documento",
    consejo: "Nombre y apellidos completos.",
    campos: ["nombre"],
  },
  {
    id: "fecha-nacimiento",
    grupo: "datos",
    admin: "Revisa la fecha de nacimiento",
    titulo: "Revisa la fecha de nacimiento",
    consejo: "Cópiala del documento.",
    campos: ["fecha"],
  },
  {
    id: "datos-tutor",
    grupo: "datos",
    admin: "Faltan los datos de quien hace la solicitud",
    titulo: "Añade tus datos como tutor",
    consejo: "Tu nombre y tu relación con el menor.",
    campos: ["tutor"],
  },
  {
    id: "numero-documento",
    grupo: "residencia",
    admin: "El número de documento no coincide",
    titulo: "Revisa el número de documento",
    consejo: "Cópialo igual, con la letra.",
    campos: ["documento"],
  },
  // One "Otro" reason per step, listed last in its group. It has no fixed title or tip: the
  // specialist writes its text (textosOtro), and the applicant reads that text as the title.
  { id: "otro-datos", grupo: "datos", admin: "Otro cambio en Datos personales", otro: true },
  { id: "otro-residencia", grupo: "residencia", admin: "Otro cambio en Residencia y documento", otro: true },
  { id: "otro-diagnostico", grupo: "diagnostico", admin: "Otro cambio en Diagnóstico", otro: true },
  { id: "otro-documentos", grupo: "documentos", admin: "Otro cambio en Documentos", otro: true },
];

const BY_ID = new Map(MOTIVOS.map((m) => [m.id, m]));

export const isOtro = (id) => Boolean(BY_ID.get(id) && BY_ID.get(id).otro);

export const grupoLabel = (key) => (GRUPOS.find((g) => g.key === key) || { label: key }).label;

// What the applicant reads for each of `ids`, in the order given: the catalog entry with
// its title (for an "Otro" reason, the specialist's text from `textosOtro`). Skips ids this
// build doesn't know and "Otro" reasons without a text.
export const motivosFor = (ids, textosOtro) =>
  (ids || [])
    .map((id) => BY_ID.get(id))
    .filter(Boolean)
    .map((m) => (m.otro ? { ...m, titulo: ((textosOtro || {})[m.id] || "").trim() } : m))
    .filter((m) => m.titulo);

// The fields the single-step page shows for `motivos`: a Set of field keys, or null for
// the whole step (when any reason has no campos, or there are no reasons).
export const camposFor = (motivos) => {
  if (!motivos.length || motivos.some((m) => !m.campos)) return null;
  return new Set(motivos.flatMap((m) => m.campos));
};

// The form URL that opens only the step of `grupo` and returns to the dashboard.
export const pasoUrl = (grupo) => `/inscribirse?paso=${grupo}&volver=panel`;
