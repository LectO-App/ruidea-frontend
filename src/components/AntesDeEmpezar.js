import React, { useCallback, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BsArrowRight,
  BsArrowLeft,
  BsFileEarmarkText,
  BsPersonSquare,
  BsPeople,
  BsEnvelope,
  BsInfoCircle,
  BsCheckCircle,
} from "react-icons/bs";

import { loadAnswers, saveAnswers } from "../util/antesDeEmpezar";
import { stepVariants, stepTransition } from "../util/motion";

// DISFAM may replace this wording. It must not say where to get a diagnosis.
export const SIN_INFORME_NOTA =
  "Sin el informe no podemos revisar la solicitud. Puedes crear la cuenta ahora y añadir el informe más tarde, cuando lo tengas.";

const PARA_QUIEN = [
  { value: "yo", label: "Para mí" },
  { value: "otra", label: "Para alguien que cuido", hint: "Tu hija o hijo, o una persona a tu cargo" },
];

const INFORME = [
  { value: "si", label: "Sí, lo tengo" },
  { value: "todavia-no", label: "Todavía no" },
  { value: "no-se", label: "No sé qué es" },
];

const ChoiceGroup = ({ legend, name, options, value, onChange }) => (
  <fieldset className="choice">
    <legend>{legend}</legend>
    <div className="choice-options">
      {options.map((o) => (
        <label key={o.value} className={`choice-card${value === o.value ? " selected" : ""}`}>
          <input type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)} />
          <span className="choice-text">
            <span>{o.label}</span>
            {o.hint && <small>{o.hint}</small>}
          </span>
        </label>
      ))}
    </div>
  </fieldset>
);

const itemsFor = ({ paraQuien }) => {
  const otra = paraQuien === "otra";
  const items = [
    {
      key: "informe",
      Icon: BsFileEarmarkText,
      title: "El informe del diagnóstico",
      text: "Firmado por el profesional, con todas sus páginas. Puede ser un PDF o fotos del documento en papel.",
    },
    {
      key: "documento",
      Icon: BsPersonSquare,
      title: "DNI, NIE o pasaporte",
      text: `${otra ? "El de la persona que cuidas" : "El tuyo"}, por las dos caras. Una foto o un PDF.`,
    },
  ];
  if (otra) {
    items.push({
      key: "tutor",
      Icon: BsPeople,
      title: "Tus datos como tutor o tutora",
      text: "Tu nombre, tus apellidos y qué relación tienes con la persona.",
    });
  }
  items.push({
    key: "correo",
    Icon: BsEnvelope,
    title: "Un correo que mires a menudo",
    text: "Con él creas la cuenta, y ahí te escribimos sobre tu solicitud.",
  });
  return items;
};

// Shown on /inscribirse before "Crear cuenta" when nobody is signed in. The answers only
// tailor the list; they stay in sessionStorage and are never sent to the server.
const AntesDeEmpezar = ({ onStart }) => {
  const reduceMotion = useReducedMotion();
  const [answers, setAnswers] = useState(loadAnswers);
  const [screen, setScreen] = useState("preguntas");
  const [direction, setDirection] = useState(1);
  // The list mounts after the questions have finished leaving, so focus it on mount.
  const focusOnMount = useCallback((el) => el && el.focus(), []);

  const answer = (key) => (value) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    saveAnswers(next);
  };

  const go = (next, dir) => {
    setDirection(dir);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const sinInforme = answers.informe === "todavia-no" || answers.informe === "no-se";

  return (
    <AnimatePresence mode="wait" custom={direction} initial={false}>
      <motion.div
        key={screen}
        custom={direction}
        variants={stepVariants(reduceMotion)}
        initial="enter"
        animate="center"
        exit="exit"
        transition={stepTransition}
      >
        {screen === "preguntas" ? (
          <>
            <header className="reg-progress">
              <p className="antes-eyebrow">Antes de empezar</p>
              <h1 className="reg-title">Veamos qué vas a necesitar</h1>
            </header>
            <div className="reg-step">
              <form
                className="step-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  go("lista", 1);
                }}
              >
                <ChoiceGroup
                  legend="¿Para quién es el pasaporte?"
                  name="antesParaQuien"
                  options={PARA_QUIEN}
                  value={answers.paraQuien}
                  onChange={answer("paraQuien")}
                />
                <ChoiceGroup
                  legend="¿Tienes ya el informe del diagnóstico?"
                  name="antesInforme"
                  options={INFORME}
                  value={answers.informe}
                  onChange={answer("informe")}
                />
                <div className="step-actions">
                  <button type="submit" className="btn-primary">
                    Ver qué necesito <BsArrowRight aria-hidden="true" />
                  </button>
                </div>
                <div className="antes-foot">
                  <p className="field-hint">Tus respuestas se quedan en este aparato.</p>
                  <button type="button" className="auth-link antes-skip" onClick={() => onStart(answers)}>
                    Saltar e ir al formulario
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <header className="reg-progress">
              <p className="antes-eyebrow">Antes de empezar</p>
              <h1 className="reg-title antes-heading" tabIndex={-1} ref={focusOnMount}>
                Ten esto a mano
              </h1>
            </header>
            <div className="reg-step step-form">
              <section className="antes-print" aria-labelledby="antes-lista-titulo">
                <h2 id="antes-lista-titulo" className="antes-print-title">
                  Para pedir el Pasaporte DEA, ten esto a mano
                </h2>
                <ul className="antes-list">
                  {itemsFor(answers).map(({ key, Icon, title, text }) => (
                    <li key={key} className="antes-item">
                      <span className="antes-icon" aria-hidden="true">
                        <Icon />
                      </span>
                      <span>
                        <strong>{title}</strong>
                        <span className="antes-item-text">{text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                {sinInforme && (
                  <p className="form-banner info">
                    <BsInfoCircle aria-hidden="true" /> {SIN_INFORME_NOTA}
                  </p>
                )}
              </section>
              <p className="antes-saved">
                <BsCheckCircle aria-hidden="true" /> Se guarda solo. Si te falta algo, puedes parar en cualquier paso y
                seguir otro día.
              </p>
              <div className="step-actions">
                <button type="button" className="btn-secondary" onClick={() => window.print()}>
                  Imprimir o guardar la lista
                </button>
                <button type="button" className="btn-primary" onClick={() => onStart(answers)}>
                  Empezar la solicitud <BsArrowRight aria-hidden="true" />
                </button>
              </div>
              <button type="button" className="auth-link antes-skip" onClick={() => go("preguntas", -1)}>
                <BsArrowLeft aria-hidden="true" /> Cambiar respuestas
              </button>
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AntesDeEmpezar;
