// The server stores a person's documents as one PDF; records from before that keep a ZIP
// of the original files. The stored blob name tells which.
export const isPdfDocuments = (archivoBlob) => typeof archivoBlob === "string" && archivoBlob.endsWith(".pdf");

// The server's limits (middlewares/upload.js in ruidea-backend), counted over every file of one upload.
export const MAX_FILES = 10;
export const MAX_FILE_MB = 25;
export const MAX_UPLOAD_MB = 60;
const MB = 1024 * 1024;

export const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / MB).toFixed(1)} MB`;
};

const fileTooLarge = (file) => {
  const what = `«${file.name}» ocupa ${formatSize(file.size)} y el máximo por archivo es ${MAX_FILE_MB} MB.`;
  if (file.type === "application/pdf") {
    return `${what} Escanéalo otra vez con menos resolución o divídelo en varios PDF más pequeños.`;
  }
  return `${what} Haz la foto otra vez con menos resolución o sube una captura de pantalla de la foto.`;
};

// The message for the first file over the limit, or for the total, or null when the files can be sent.
export const sizeProblem = (files) => {
  const tooLarge = files.find((file) => file.size > MAX_FILE_MB * MB);
  if (tooLarge) return fileTooLarge(tooLarge);
  const total = files.reduce((sum, file) => sum + file.size, 0);
  if (total > MAX_UPLOAD_MB * MB) {
    return `Los archivos ocupan ${formatSize(total)} en total y el máximo por envío es ${MAX_UPLOAD_MB} MB. Quita alguno o escanea los PDF con menos resolución.`;
  }
  return null;
};

// A 413 from the server carries a message that names the limit; one from a proxy has none.
export const uploadErrorMessage = (err) => {
  const response = err && err.response;
  if (!response || response.status !== 413) return null;
  const message = response.data && response.data.message;
  if (typeof message === "string" && message) return message;
  return `Los archivos ocupan demasiado para enviarlos. El máximo es ${MAX_FILE_MB} MB por archivo y ${MAX_UPLOAD_MB} MB en total: escanea los PDF con menos resolución o divídelos en varios.`;
};

const PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
const MAX_EDGE = 2000; // the server scales photos to the same size for the PDF

// A photo larger than MAX_EDGE on its longest edge comes back as a JPEG of that size, turned
// upright from its EXIF orientation. Other files, and photos the browser cannot decode (HEIC
// outside Safari), come back as they are: the server converts those.
export const shrinkPhoto = async (file) => {
  if (!PHOTO_TYPES.has(file.type)) return file;
  let bitmap;
  try {
    bitmap = await window.createImageBitmap(file, { imageOrientation: "from-image" });
  } catch (err) {
    return file;
  }
  try {
    const scale = MAX_EDGE / Math.max(bitmap.width, bitmap.height);
    if (scale >= 1) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff"; // a transparent PNG gets a white page, not a black one
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return file;
    return new File([blob], file.name, { type: "image/jpeg", lastModified: file.lastModified });
  } finally {
    bitmap.close();
  }
};
