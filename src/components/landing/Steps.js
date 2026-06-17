import React from "react";

const STEPS = [
  {
    title: "Inscríbete",
    text:
      "Completa el registro y aporta el documento que avala tu DEA junto con una identificación oficial.",
    icon: (
      <path
        d="M9 4h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm1 5h4m-4 4h4m-4 4h2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Validamos y emitimos",
    text:
      "Comprobamos la validez de la documentación y enviamos tu pasaporte digital a tu correo electrónico.",
    icon: (
      <path
        d="M12 3 5 6v5c0 4.4 3 7.6 7 9 4-1.4 7-4.6 7-9V6l-7-3Zm-2.5 8.5 1.8 1.8 3.7-3.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Reconocimiento y verificación",
    text:
      "Preséntalo ante centros y autoridades, que comprueban su autenticidad por la web o el código QR.",
    icon: (
      <path
        d="M4 4h6v6H4V4Zm0 10h6v6H4v-6ZM14 4h6v6h-6V4Zm0 10h2m4 0v6m-4-3h2m-2 3h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

const Steps = () => (
  <section className="lp-section">
    <div className="lp-container">
      <span className="lp-eyebrow">¿Cómo funciona?</span>
      <h2 className="lp-section__title">Tu pasaporte en tres pasos</h2>

      <ol className="lp-steps">
        {STEPS.map((step, i) => (
          <li className="lp-step" key={step.title}>
            <span className="lp-step__num">{i + 1}</span>
            <span className="lp-step__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="26" height="26">
                {step.icon}
              </svg>
            </span>
            <h3 className="lp-step__title">{step.title}</h3>
            <p className="lp-step__text">{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default Steps;
