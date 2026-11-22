// The server stores a person's documents as one PDF; records from before that keep a ZIP
// of the original files. The stored blob name tells which.
export const isPdfDocuments = (archivoBlob) => typeof archivoBlob === "string" && archivoBlob.endsWith(".pdf");

// The server's limit, counted over every file of one upload.
export const MAX_FILES = 10;
