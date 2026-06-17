import React, { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

// Accessible dialog primitive. Renders into a portal at <body> and, while open:
//   • traps Tab focus inside the panel (Tab/Shift+Tab cycle, never escape behind it)
//   • moves focus into the dialog on open (the first field on pointer devices, the
//     panel itself on touch so the keyboard doesn't pop up unexpectedly)
//   • restores focus to the trigger element on close
//   • locks body scroll so the page behind doesn't move
//   • closes on Escape or overlay click
// Animation is fade/rise in, subtler out. Used for the few interactions that genuinely
// need a dialog (a confirmation, a short input) — not for errors, which are inline/toasts.
const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

const isTouchDevice = () =>
  typeof window !== "undefined" &&
  ("ontouchstart" in window || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches));

const Modal = ({ open, onClose, title, children }) => {
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = useId();

  // Remember the element that had focus so we can return to it on close.
  useEffect(() => {
    if (open) restoreFocusRef.current = document.activeElement;
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Move focus into the dialog on open; restore it to the trigger on close.
  useEffect(() => {
    if (!open) return undefined;
    const panel = panelRef.current;
    if (panel) {
      const focusables = panel.querySelectorAll(FOCUSABLE);
      const first = focusables[0];
      // Avoid auto-opening the keyboard on touch — focus the panel shell instead.
      if (first && !isTouchDevice()) first.focus();
      else panel.focus();
    }
    return () => {
      const el = restoreFocusRef.current;
      if (el && typeof el.focus === "function") el.focus();
    };
  }, [open]);

  // Escape to close + Tab focus trap.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusables.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            ref={panelRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <h2 className="modal-title" id={titleId}>
                {title}
              </h2>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
