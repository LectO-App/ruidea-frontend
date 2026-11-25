import React, { useState, useEffect, useRef } from "react";
import {
  AiOutlineCloudUpload,
  AiOutlineFilePdf,
  AiOutlineCloseCircle,
  AiOutlineArrowUp,
  AiOutlineArrowDown,
} from "react-icons/ai";

import { formatSize, shrinkPhoto, MAX_FILE_MB } from "../../util/documents";

// Accessible document picker (REGISTRATION_UX.md §5): click OR drag (never drag-only,
// WCAG 2.2 §2.5.7), accepts a phone photo or a PDF (not PDF-only), shows thumbnail
// previews with per-file remove, and states the limits up front. The server joins the
// files into one PDF in list order, so the list is numbered and each file has move
// buttons (keyboard and screen reader friendly, not drag-only). Not bound to
// react-hook-form — it owns a File[] and reports changes up via onFilesChange.

const ACCEPT = "application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif";

// Name and date, not size: a photo is smaller once shrunk, and picking it again must not add it twice.
const fileKey = (f) => `${f.name}:${f.lastModified}`;

const FilePreview = ({ file, position, total, onRemove, onMove, buttonRef }) => {
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
      <span className="file-order" aria-hidden="true">
        {position}
      </span>
      <span className="file-thumb">
        {isImage && url ? (
          <img src={url} alt="" />
        ) : (
          <AiOutlineFilePdf size={26} aria-hidden="true" />
        )}
      </span>
      <span className="file-meta">
        <span className="file-name">{file.name}</span>
        <span className="file-size">{formatSize(file.size)}</span>
      </span>
      {total > 1 && (
        <span className="file-move">
          <button
            type="button"
            ref={buttonRef("up")}
            aria-label={`Mover ${file.name} antes`}
            title="Mover antes"
            disabled={position === 1}
            onClick={() => onMove(-1)}
          >
            <AiOutlineArrowUp size={20} aria-hidden="true" />
          </button>
          <button
            type="button"
            ref={buttonRef("down")}
            aria-label={`Mover ${file.name} después`}
            title="Mover después"
            disabled={position === total}
            onClick={() => onMove(1)}
          >
            <AiOutlineArrowDown size={20} aria-hidden="true" />
          </button>
        </span>
      )}
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
  const [announcement, setAnnouncement] = useState("");
  const [focusAfterMove, setFocusAfterMove] = useState(null);
  const moveButtons = useRef({});
  const inputId = `file-${id}`;

  // Moving a file re-renders the list; keep the focus on the moved file's buttons, on the
  // other one when the pressed button is now disabled (the file reached an end).
  useEffect(() => {
    if (!focusAfterMove) return;
    const { key, dir } = focusAfterMove;
    const pressed = moveButtons.current[`${key}:${dir}`];
    const other = moveButtons.current[`${key}:${dir === "up" ? "down" : "up"}`];
    const target = pressed && !pressed.disabled ? pressed : other;
    if (target) target.focus();
    setFocusAfterMove(null);
  }, [focusAfterMove]);

  const addFiles = async (fileList) => {
    const incoming = Array.from(fileList || []);
    if (!incoming.length) return;
    const shrunk = await Promise.all(incoming.map(shrinkPhoto));
    // Shrinking takes a moment: merge into the list as it is then, not as it was on picking.
    onFilesChange((current) => {
      const seen = new Set(current.map(fileKey));
      const merged = [...current];
      shrunk.forEach((f) => {
        const key = fileKey(f);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(f);
        }
      });
      return merged;
    });
  };

  const removeAt = (index) => onFilesChange(files.filter((_, i) => i !== index));

  const move = (index, step) => {
    const to = index + step;
    if (to < 0 || to >= files.length) return;
    const next = [...files];
    [next[index], next[to]] = [next[to], next[index]];
    onFilesChange(next);
    setAnnouncement(`${files[index].name}: ahora es el ${to + 1} de ${files.length}.`);
    setFocusAfterMove({ key: fileKey(files[index]), dir: step < 0 ? "up" : "down" });
  };

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
          <small>Mejor un solo PDF · también fotos · hasta 10 archivos en total · {MAX_FILE_MB} MB como máximo cada uno</small>
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

      {files.length > 1 && <p className="field-hint">Las páginas irán en este orden. Usa las flechas para cambiarlo.</p>}
      {files.length > 0 && (
        <ol className="file-list" aria-label={`Archivos de ${label}, en el orden de las páginas`}>
          {files.map((file, i) => (
            <FilePreview
              key={fileKey(file)}
              file={file}
              position={i + 1}
              total={files.length}
              onRemove={() => removeAt(i)}
              onMove={(step) => move(i, step)}
              buttonRef={(dir) => (el) => {
                moveButtons.current[`${fileKey(file)}:${dir}`] = el;
              }}
            />
          ))}
        </ol>
      )}
      <span className="visually-hidden" role="status" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
};

export default DocumentUploader;
