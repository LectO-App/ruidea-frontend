import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { subscribeToasts, getToasts, toast } from "./toast";

// Renders the active toasts (top-right stack). Mounted once at the app root. Each toast is
// dismissable by click and announced to assistive tech (errors assertively, the rest politely).
const ICONS = { success: "✓", error: "!", info: "i" };

const Toaster = () => {
  const [items, setItems] = useState(getToasts());

  useEffect(() => subscribeToasts(setItems), []);

  return (
    <div className="toaster" role="region" aria-label="Notificaciones">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            className={`toast toast-${t.type}`}
            role={t.type === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => toast.dismiss(t.id)}
          >
            <span className="toast-icon" aria-hidden="true">
              {ICONS[t.type]}
            </span>
            <p className="toast-msg">{t.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster;
