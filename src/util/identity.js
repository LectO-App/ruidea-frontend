// Client-side mirror of the backend's validation/identity.js. Validating here means a
// user with dyslexia/dyscalculia gets an instant, kind correction next to the field
// instead of a server round-trip and a generic error (REGISTRATION_UX.md §3, §4).
//
// The DNI/NIE checksum is deterministic, so we validate AND block on it. Phone is kept
// lenient on purpose — the backend (libphonenumber) is the source of truth, so we only
// catch obvious nonsense here and never block a number the server would accept.

const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

export const isValidDni = (value) => {
  const m = /^(\d{8})([A-Z])$/.exec(String(value).trim().toUpperCase());
  if (!m) return false;
  return DNI_LETTERS[parseInt(m[1], 10) % 23] === m[2];
};

export const isValidNie = (value) => {
  const m = /^([XYZ])(\d{7})([A-Z])$/.exec(String(value).trim().toUpperCase());
  if (!m) return false;
  const prefix = { X: "0", Y: "1", Z: "2" }[m[1]];
  return DNI_LETTERS[parseInt(prefix + m[2], 10) % 23] === m[3];
};

export const isValidPassport = (value) =>
  /^[A-Z0-9]{5,20}$/.test(String(value).trim().toUpperCase());

// Returns null when valid, or a kind, specific message when not. The DNI/NIE check
// letter is a SPANISH thing — RUIDEA serves all of Iberoamerica, where a DNI is often
// just digits (e.g. an Argentine DNI like 45570422). So we only apply the strict
// checksum when the country is Spain; elsewhere we accept any reasonable number (§3).
export const documentoError = (tipo, value, pais) => {
  const v = String(value || "").trim();
  if (!v) return "Por favor, escribe tu número de documento";
  if (pais !== "España") {
    return v.length >= 4 ? null : "Revisa el número de documento";
  }
  if (tipo === "dni" && !isValidDni(v))
    return "Ese DNI no es correcto. Revisa los 8 números y la letra (ej. 12345678Z)";
  if (tipo === "nie" && !isValidNie(v))
    return "Ese NIE no es correcto. Revisa el formato (ej. X1234567L)";
  if (tipo === "pasaporte" && !isValidPassport(v))
    return "Revisa el número de pasaporte";
  return null;
};

export const normalizeDocumento = (value) =>
  String(value || "").trim().toUpperCase();

// Lenient phone check — accepts digits, spaces and a leading +, 6–15 digits. The server
// canonicalises to E.164; we only stop obvious typos.
export const looksLikePhone = (value) => {
  const digits = String(value || "").replace(/[^\d]/g, "");
  return /^[+]?[\d ]+$/.test(String(value || "").trim()) && digits.length >= 6 && digits.length <= 15;
};

const COMMON_DOMAINS = [
  "gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "yahoo.es",
  "hotmail.es", "outlook.es", "live.com", "icloud.com", "protonmail.com",
];

const levenshtein = (a, b) => {
  const m = a.length;
  const n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
    }
  }
  return d[m][n];
};

// "juan@gmial.com" -> "juan@gmail.com"; returns null when the domain looks fine.
export const suggestEmail = (email) => {
  const value = String(email || "").trim().toLowerCase();
  const at = value.lastIndexOf("@");
  if (at < 1) return null;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!domain || COMMON_DOMAINS.includes(domain)) return null;
  let best = null;
  let bestDist = Infinity;
  for (const candidate of COMMON_DOMAINS) {
    const dist = levenshtein(domain, candidate);
    if (dist < bestDist) {
      bestDist = dist;
      best = candidate;
    }
  }
  return best && bestDist > 0 && bestDist <= 2 ? `${local}@${best}` : null;
};

// Month names so the date of birth is picked from a list (dyscalculia §2) rather than
// typed as a number or hunted for in a calendar that opens on today (dyspraxia §2).
export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Build an ISO yyyy-mm-dd from day/month/year parts, or null if incomplete/implausible.
export const partsToISODate = (dia, mes, anio) => {
  const d = parseInt(dia, 10);
  const m = parseInt(mes, 10); // 1-12
  const y = parseInt(anio, 10);
  if (!d || !m || !y) return null;
  if (d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > new Date().getFullYear()) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCDate() !== d || date.getUTCMonth() !== m - 1) return null; // e.g. 31 Feb
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
};

export const isoToParts = (iso) => {
  if (!iso) return { dia: "", mes: "", anio: "" };
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso));
  if (!m) return { dia: "", mes: "", anio: "" };
  return { dia: String(parseInt(m[3], 10)), mes: String(parseInt(m[2], 10)), anio: m[1] };
};

export const passwordStrength = (value) => {
  const v = String(value || "");
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  const labels = ["Muy débil", "Débil", "Aceptable", "Buena", "Fuerte"];
  return { score: Math.min(score, 4), label: labels[Math.min(score, 4)] };
};
