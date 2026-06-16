import React from "react";
import { BsCheck } from "react-icons/bs";

// A calm "where am I?" indicator for the dashboard. The waiting state is the emptiest
// moment of the journey, so we orient the user with the steps that remain — deliberately
// WITHOUT any time estimate (review is volunteer work, so we never promise a date).
// Reuses the .timeline styles from registration.scss.
const StatusSteps = ({ steps, activeKey }) => {
  const activeIndex = steps.findIndex((s) => s.key === activeKey);

  return (
    <ol className="timeline" aria-label="Estado de tu solicitud">
      {steps.map((step, i) => {
        const Icon = step.icon;
        const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming";
        return (
          <li key={step.key} className={`timeline-step ${state}`}>
            <span className="timeline-icon" aria-hidden="true">
              {state === "done" ? <BsCheck size={24} /> : <Icon size={22} />}
            </span>
            <div className="timeline-body">
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </div>
            {state === "active" && <span className="timeline-tag">Ahora</span>}
          </li>
        );
      })}
    </ol>
  );
};

export default StatusSteps;
