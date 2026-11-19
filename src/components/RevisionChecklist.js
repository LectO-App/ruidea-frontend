import React from "react";
import { Link } from "react-router-dom";
import { BsCheckCircle, BsArrowRight } from "react-icons/bs";

import InlineMessage from "./ui/InlineMessage";
import { motivosFor, pasoUrl } from "../util/motivosRevision";

const cosas = (n) => (n === 1 ? "1 cosa" : `${n} cosas`);

// What a specialist asked to change, one item per reason with a plain tip and a link that
// opens only the form step that fixes it. An item is done once its step changed since the
// specialist's decision (cambiosDesdeRevision). Progress is written out, never colour only.
const RevisionChecklist = ({ motivosRevision, cambiosDesdeRevision, mensajeMedico, onReenviar, sending, error }) => {
  const motivos = motivosFor(motivosRevision);
  const cambiados = new Set(cambiosDesdeRevision || []);
  const hechos = motivos.filter((m) => cambiados.has(m.grupo)).length;
  const faltan = motivos.length - hechos;

  return (
    <div className="revision">
      <h2 className="revision-title">
        {faltan > 0 ? `Falta poco: ${cosas(faltan)} por cambiar` : "Ya está todo: envía tu solicitud de nuevo"}
      </h2>
      <p className="revision-progress">
        Has cambiado {hechos} de {motivos.length}.
      </p>

      <ol className="revision-list">
        {motivos.map((m) => {
          const hecho = cambiados.has(m.grupo);
          return (
            <li key={m.id} className={`revision-item${hecho ? " is-done" : ""}`}>
              <p className="revision-item-title">{m.titulo}</p>
              <p className="revision-item-tip">{m.consejo}</p>
              <div className="revision-item-foot">
                {hecho && (
                  <span className="revision-done">
                    <BsCheckCircle aria-hidden="true" /> Hecho
                  </span>
                )}
                <Link className={hecho ? "revision-link revision-link--again" : "revision-link"} to={pasoUrl(m.grupo)}>
                  {hecho ? "Cambiar otra vez" : m.accion}
                  <span className="sr-only">: {m.titulo}</span>
                  <BsArrowRight aria-hidden="true" />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      {mensajeMedico && (
        <div className="status-note">
          <span className="status-note-label">Mensaje del especialista</span>
          <p>{mensajeMedico}</p>
        </div>
      )}

      <div className="status-actions">
        <button className="btn-primary" onClick={onReenviar} disabled={sending}>
          {sending && <span className="btn-spinner" aria-hidden="true" />}
          Enviar de nuevo
        </button>
      </div>
      <InlineMessage type="error">{error}</InlineMessage>
    </div>
  );
};

export default RevisionChecklist;
