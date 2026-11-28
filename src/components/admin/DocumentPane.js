import React, { useState, useEffect, useCallback } from "react";
import { axiosInstance } from "../../axios";

import { toast } from "../ui/toast";
import { isPdfDocuments } from "../../util/documents";

// The SAS link from /inscripcion/link-archivos lasts 5 minutes; past this age a new tab
// asks for a fresh one instead of opening an expired link.
const LINK_TTL_MS = 4 * 60 * 1000;

const fetchLink = async (id) => {
  const res = await axiosInstance.get(`/inscripcion/link-archivos/${id}`);
  return { url: res.data.url, at: Date.now() };
};

const openInNewTab = (url) => {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener";
  link.click();
};

// New uploads are one PDF, shown embedded beside the data; older records are a ZIP to download.
const DocumentPane = ({ user }) => {
  const pdf = isPdfDocuments(user.archivoBlob);
  const [link, setLink] = useState(null);
  const [status, setStatus] = useState(pdf ? "loading" : "idle");
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      setLink(await fetchLink(user._id));
      setStatus("ready");
    } catch (err) {
      setStatus("error");
    }
  }, [user._id]);

  useEffect(() => {
    if (pdf) load();
  }, [pdf, load]);

  const openFresh = async (e) => {
    if (Date.now() - link.at < LINK_TTL_MS) return;
    e.preventDefault();
    try {
      const fresh = await fetchLink(user._id);
      setLink(fresh);
      openInNewTab(fresh.url);
    } catch (err) {
      toast.error("No se pudo abrir el documento.");
    }
  };

  const downloadZip = async () => {
    setDownloading(true);
    try {
      openInNewTab((await fetchLink(user._id)).url);
    } catch (err) {
      toast.error("No se encontraron documentos para este usuario.");
    } finally {
      setDownloading(false);
    }
  };

  const newTabLink = (text) => (
    <a className="adm-doc__open" href={link.url} target="_blank" rel="noopener noreferrer" onClick={openFresh}>
      {text}
    </a>
  );

  return (
    <section className="adm-doc" aria-labelledby="adm-doc-title">
      <div className="adm-doc__head">
        <h2 className="adm-doc__title" id="adm-doc-title">
          Informe y documento de identidad
        </h2>
        {status === "ready" && newTabLink("Abrir en otra pestaña")}
      </div>

      {!user.archivoBlob && <p className="adm-doc__msg">Sin documentos subidos.</p>}

      {user.archivoBlob && !pdf && (
        <div className="adm-doc__msg">
          <p>Esta solicitud es anterior al PDF único: sus documentos están en un ZIP.</p>
          <button className="adm-btn adm-btn--ghost" onClick={downloadZip} disabled={downloading}>
            {downloading ? "Descargando…" : "Descargar diagnóstico e identificación (ZIP)"}
          </button>
        </div>
      )}

      {status === "loading" && (
        <p className="adm-doc__msg" role="status">
          Cargando el documento…
        </p>
      )}

      {status === "error" && (
        <p className="adm-doc__msg" role="alert">
          No se pudo cargar el documento.{" "}
          <button className="adm-link" onClick={load}>
            Reintentar
          </button>
        </p>
      )}

      {status === "ready" && (
        <object className="adm-doc__frame" data={link.url} type="application/pdf" aria-label="Informe y documento de identidad (PDF)">
          <div className="adm-doc__msg">
            <p>Este navegador no puede mostrar el PDF aquí.</p>
            {newTabLink("Ábrelo en otra pestaña")}
          </div>
        </object>
      )}
    </section>
  );
};

export default DocumentPane;
