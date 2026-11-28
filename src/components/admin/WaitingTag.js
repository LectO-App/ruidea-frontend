import React from "react";
import { daysWaiting, esperandoLabel } from "../../util/waiting";

const WaitingTag = ({ item }) => {
  const days = daysWaiting(item);
  if (days == null) return null;
  return (
    <span className="adm-wait">
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
      {esperandoLabel(days)}
    </span>
  );
};

export default WaitingTag;
