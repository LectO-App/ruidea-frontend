import React from "react";
import { Link } from "react-router-dom";

// The actions of a step opened on its own from the dashboard (?paso=…&volver=panel):
// "Guardar" saves the step and returns; "Volver" returns without saving.
const SingleStepActions = ({ busy }) => (
  <div className="step-actions step-actions--single">
    <Link className="step-back-link" to="/dashboard">
      Volver
    </Link>
    <button type="submit" className="btn-primary" disabled={busy}>
      {busy && <span className="btn-spinner" aria-hidden="true" />}
      Guardar
    </button>
  </div>
);

export default SingleStepActions;
