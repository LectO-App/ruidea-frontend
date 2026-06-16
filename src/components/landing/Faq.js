import React from "react";

// Native <details> for progressive disclosure — accessible and keyboard-friendly with no JS.
const FAQS = [
  {
    q: "¿Tiene algún coste?",
    a: "No. La inscripción en el registro y la emisión del pasaporte digital son totalmente gratuitas.",
  },
  {
    q: "¿En qué países es válido?",
    a: "RUIDEA cuenta con el apoyo de la gran mayoría de países iberoamericanos, cuyos Ministerios de Educación lo respaldaron en la Comisión Iberoamericana de Dislexia y otras DEA.",
  },
  {
    q: "¿Qué documentación necesito?",
    a: "Un documento que avale tu Dificultad Específica del Aprendizaje y una identificación oficial para confirmar la validez de ambos.",
  },
  {
    q: "¿Cómo recibo el pasaporte?",
    a: "Una vez comprobada la validez de la documentación, recibirás el pasaporte digital en la dirección de correo electrónico que facilitaste.",
  },
  {
    q: "¿Cómo se verifica el pasaporte?",
    a: "Las autoridades e instituciones pueden comprobar su autenticidad a través de esta página web o escaneando el código QR del documento.",
  },
];

const Faq = () => (
  <section className="lp-section" id="faq">
    <div className="lp-container">
      <span className="lp-eyebrow">Preguntas frecuentes</span>
      <h2 className="lp-section__title">Lo que necesitas saber</h2>

      <div className="lp-faq">
        {FAQS.map((item) => (
          <details className="lp-faq__item" key={item.q}>
            <summary className="lp-faq__q">
              {item.q}
              <span className="lp-faq__chevron" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path
                    d="m6 9 6 6 6-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </summary>
            <p className="lp-faq__a">{item.a}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

export default Faq;
