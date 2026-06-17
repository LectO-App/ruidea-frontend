import React from "react";

// In-context status banner shown right where the action happened (e.g. under a form), not as
// a blocking modal. `type`: "error" | "success" | "info". Renders nothing when empty, so call
// sites can do {<InlineMessage type="error">{error}</InlineMessage>} unconditionally.
const InlineMessage = ({ type = "error", children, className = "" }) => {
  if (!children) return null;
  return (
    <div
      className={`inline-msg inline-msg-${type} ${className}`.trim()}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
};

export default InlineMessage;
