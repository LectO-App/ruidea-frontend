import React, { useState, useEffect } from "react";
import { AiOutlineCloudUpload, AiOutlineFilePdf, AiOutlineCloseCircle } from "react-icons/ai";

// Accessible document picker (REGISTRATION_UX.md §5): click OR drag (never drag-only,
// WCAG 2.2 §2.5.7), accepts a phone photo or a PDF (not PDF-only), shows thumbnail
// previews with per-file remove, and states the limits up front. Not bound to
// react-hook-form — it owns a File[] and reports changes up via onFilesChange.

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif";

const prettySize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FilePreview = ({ file, onRemove }) => {
  const [url, setUrl] = useState(null);
  const isImage = file.type && file.type.startsWith("image/");

  useEffect(() => {
    if (!isImage) return undefined;
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isImage]);

  return (
    <li className="file-chip">
      <span className="file-thumb">
        {isImage && url ? (
          <img src={url} alt="" />
        ) : (
          <AiOutlineFilePdf size={26} aria-hidden="true" />
        )}
      </span>
      <span className="file-meta">
        <span className="file-name">{file.name}</span>
        <span className="file-size">{prettySize(file.size)}</span>
      </span>
      <button
        type="button"
        className="file-remove"
        aria-label={`Quitar ${file.name}`}
        onClick={onRemove}
      >
        <AiOutlineCloseCircle size={22} />
      </button>
    </li>
  );
};

const DocumentUploader = ({ id, label, hint, files = [], onFilesChange }) => {
  const [dragging, setDragging] = useState(false);
  const inputId = `file-${id}`;

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    // Dedupe by name+size so re-picking the same file doesn't double it up.
    const seen = new Set(files.map((f) => `${f.name}:${f.size}`));
    const merged = [...files];
    incoming.forEach((f) => {
      const key = `${f.name}:${f.size}`;
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(f);
      }
    });
    onFilesChange(merged);
  };

  const removeAt = (index) => onFilesChange(files.filter((_, i) => i !== index));

  return (
    <div className="uploader">
      <span className="uploader-label" id={`${inputId}-label`}>
        {label}
      </span>
      {hint && <p className="field-hint">{hint}</p>}

      <label
        htmlFor={inputId}
        className={`dropzone${dragging ? " dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
      >
        <AiOutlineCloudUpload size={34} aria-hidden="true" />
        <span className="dropzone-text">
          <strong>Toca para elegir</strong> o arrastra aquí
          <small>Foto o PDF · hasta 10 archivos</small>
        </span>
        <input
          type="file"
          id={inputId}
          multiple
          accept={ACCEPT}
          aria-labelledby={`${inputId}-label`}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = ""; // allow re-selecting the same file after removing it
          }}
        />
      </label>

      {files.length > 0 && (
        <ul className="file-list">
          {files.map((file, i) => (
            <FilePreview key={`${file.name}:${file.size}:${i}`} file={file} onRemove={() => removeAt(i)} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default DocumentUploader;
