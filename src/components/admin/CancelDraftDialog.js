import React, { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../../axios";

import Modal from "../ui/Modal";
import InlineMessage from "../ui/InlineMessage";
import { toast } from "../ui/toast";

// Confirms cancelling an unfinished application (POST /admin/borradores/:id/cancelar). The
// back end deletes the record and its documents; `avisar` emails the person.
const CancelDraftDialog = ({ draft, onClose, onCancelled }) => {
  const [avisar, setAvisar] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!draft) return;
    setAvisar(true);
    setError(null);
  }, [draft]);

  const confirm = async () => {
    setBusy(true);
    setError(null);
    try {
      await axiosInstance.post(`/admin/borradores/${draft._id}/cancelar`, { avisar });
      onCancelled(draft._id);
      onClose();
      toast.success("Solicitud cancelada");
    } catch (err) {
      const message = err && err.response && err.response.data && err.response.data.message;
      setError(message || "No se pudo cancelar la solicitud. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  // Keeps the name on screen while the dialog fades out after `draft` is cleared.
  const shown = useRef(draft);
  if (draft) shown.current = draft;
  const d = shown.current || {};
  const nombre = `${d.nombre || ""} ${d.apellidos || ""}`.trim() || d.correoElectronico;

  return (
    <Modal open={!!draft} onClose={onClose} title="Cancelar la solicitud sin terminar">
      <p className="adm-confirm-text">
        Vas a cancelar la solicitud sin terminar de <strong>{nombre}</strong>. Se borrarán los datos que guardó y los
        documentos que subió. No se puede deshacer.
      </p>
      <p className="adm-confirm-text adm-confirm-text--next">
        La persona podrá registrarse otra vez con el mismo correo.
      </p>
      <label className="adm-check">
        <input type="checkbox" checked={avisar} onChange={(e) => setAvisar(e.target.checked)} />
        Avisar a la persona por correo
      </label>
      <InlineMessage type="error">{error}</InlineMessage>
      <div className="modal-actions">
        <button className="adm-btn adm-btn--ghost" onClick={onClose}>
          Volver
        </button>
        <button className="adm-btn adm-btn--reject" onClick={confirm} disabled={busy}>
          {busy ? "Cancelando…" : "Sí, cancelar la solicitud"}
        </button>
      </div>
    </Modal>
  );
};

export default CancelDraftDialog;
