import React from "react";
import { Link } from "react-router-dom";
import { BsCheckCircle, BsArrowRight } from "react-icons/bs";

import InlineMessage from "./ui/InlineMessage";
import { motivosFor, pasoUrl, grupoLabel } from "../util/motivosRevision";

const cambios = (n) => (n === 1 ? "1 cambio" : `${n} cambios`);

// What a specialist asked to change: one heading with the stable total, a text progress line and one whole-card
// link per reason, which opens only the form step that fixes it. An item is done once its
// step changed since the decision (cambiosDesdeRevision); done shows a check and "Hecho",
// never colour alone. The specialist's message, if any, comes after the items.
const RevisionChecklist = ({
  motivosRevision,
  textosOtro,
  cambiosDesdeRevision,
  mensajeMedico,
  onReenviar,
  sending,
  error,
}) => {
  const motivos = motivosFor(motivosRevision, textosOtro);
  const cambiados = new Set(cambiosDesdeRevision || []);
  const hechos = motivos.filter((m) => cambiados.has(m.grupo)).length;
  const faltan = motivos.length - hechos;

  return (
    <div className="revision">
      <h1 className="revision-title">
        {faltan > 0 ? `El equipo médico te pide ${cambios(motivos.length)}` : "Todo listo. Envíala de nuevo."}
      </h1>
      {faltan > 0 && (
        <p className="revision-progress">
          {hechos} de {motivos.length} {motivos.length === 1 ? "hecho" : "hechos"}
        </p>
      )}

      <ul className="revision-list">
        {motivos.map((m) => {
          const hecho = cambiados.has(m.grupo);
          return (
            <li key={m.id}>
              <Link className={`revision-item${hecho ? " is-done" : ""}`} to={pasoUrl(m.grupo)}>
                <span className="revision-item-body">
                  {m.otro && <span className="revision-item-step">{grupoLabel(m.grupo)}</span>}
                  <span className="revision-item-title">{m.titulo}</span>
                  {m.consejo && <span className="revision-item-tip">{m.consejo}</span>}
                </span>
                {hecho ? (
                  <span className="revision-done">
                    <BsCheckCircle aria-hidden="true" /> Hecho
                  </span>
                ) : (
                  <BsArrowRight className="revision-arrow" aria-hidden="true" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {mensajeMedico && (
        <div className="revision-note">
          <p className="revision-note-label">Mensaje del especialista</p>
          <p>{mensajeMedico}</p>
        </div>
      )}

      <button
        type="button"
        className="btn-primary revision-send"
        onClick={() => !sending && onReenviar()}
        aria-busy={sending ? "true" : undefined}
      >
        {sending && <span className="btn-spinner" aria-hidden="true" />}
        Enviar de nuevo
      </button>
      <InlineMessage type="error">{error}</InlineMessage>
    </div>
  );
};

export default RevisionChecklist;
