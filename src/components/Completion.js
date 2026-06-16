import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { BsCheck, BsEnvelope, BsClipboard, BsAward } from "react-icons/bs";

// Finishing this form is a milestone for someone who struggled through it — so the end is
// a real "you did it + here's what happens next" moment, not a bare checkmark (§7).
const STEP_META = {
  "verifica-email": {
    icon: BsEnvelope,
    title: "Verifica tu correo",
    desc: "Te enviamos un email. Ábrelo y confirma tu dirección para que podamos seguir.",
  },
  "revision-medica": {
    icon: BsClipboard,
    title: "Revisión médica",
    desc: "Un especialista revisará tu solicitud y los documentos.",
  },
  "pasaporte-emitido": {
    icon: BsAward,
    title: "Pasaporte emitido",
    desc: "Cuando se apruebe, podrás descargar tu pasaporte DEA.",
  },
};

const Completion = ({ data, reduceMotion, historyPush }) => {
  const pasos = (data && data.pasos) || ["verifica-email", "revision-medica", "pasaporte-emitido"];
  const siguiente = (data && data.siguientePaso) || pasos[0];
  const mensaje = (data && data.mensaje) || "¡Listo! Tu solicitud está en camino.";

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const container = reduceMotion
    ? {}
    : { animate: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } };
  const item = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
      };

  const activeIndex = pasos.indexOf(siguiente);

  return (
    <div className="completion-screen">
      <motion.div
        className="completion"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.span
          className="completion-check"
          initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          <BsCheck size={38} aria-hidden="true" />
        </motion.span>

        <h1 className="completion-title">{mensaje}</h1>

        <motion.ol className="timeline" variants={container} initial="initial" animate="animate">
          {pasos.map((key, i) => {
            const meta = STEP_META[key] || { icon: BsClipboard, title: key, desc: "" };
            const Icon = meta.icon;
            const state = i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming";
            return (
              <motion.li key={key} className={`timeline-step ${state}`} variants={item}>
                <span className="timeline-icon" aria-hidden="true">
                  <Icon size={22} />
                </span>
                <div className="timeline-body">
                  <h3>{meta.title}</h3>
                  <p>{meta.desc}</p>
                </div>
                {state === "active" && <span className="timeline-tag">Ahora</span>}
              </motion.li>
            );
          })}
        </motion.ol>

        <div className="step-actions center">
          <button type="button" className="btn-primary" onClick={() => historyPush("/dashboard")}>
            Ir a mi panel
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Completion;
