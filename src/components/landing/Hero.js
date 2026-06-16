import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import ReactGA from "react-ga";

import { useAuthStatus } from "../../useAuthStatus";

import logoRuidea from "../../img/svg/logo-ruidea.svg";
import logoRuideaPNG from "../../img/png/logo-ruidea.png";
import logoDisfam from "../../img/png/logo-disfam.png";

// Code-built mock of the real PASAPORTE DEA (see backend functions/passportTemplate.js):
// teal top bar with country + "PASAPORTE DEA" + DISFAM crest, RUIDEA logo beside the
// holder's data, QR + legal footer. Sample data only — decorative, so hidden from AT.
const PassportMockup = () => (
  <div className="lp-passport" role="img" aria-label="Ejemplo de pasaporte DEA verificado">
    <span className="lp-passport__stamp" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="13" height="13">
        <path
          d="M20 6 9 17l-5-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verificado
    </span>

    <div className="lp-passport__bar">
      <span className="lp-passport__country">
        <span aria-hidden="true">🇪🇸</span> España
      </span>
      <span className="lp-passport__title">PASAPORTE DEA</span>
      <span className="lp-passport__disfam">
        <img src={logoDisfam} alt="" />
      </span>
    </div>

    <div className="lp-passport__main">
      <div className="lp-passport__logo">
        <picture>
          <source srcSet={logoRuidea} type="image/svg+xml" />
          <img src={logoRuideaPNG} alt="" />
        </picture>
      </div>

      <div className="lp-passport__info">
        <p className="lp-passport__name">Hugo Salas Ocaña</p>
        <p className="lp-passport__dob">12/04/2017</p>
        <p className="lp-passport__dni">12180427Z</p>
        <p className="lp-passport__nro">Pasaporte N.º 0012345</p>
      </div>

      <div className="lp-passport__qr" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <rect width="100" height="100" rx="6" fill="#fff" />
          <rect x="8" y="8" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
          <rect x="66" y="8" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
          <rect x="8" y="66" width="26" height="26" rx="4" fill="none" stroke="currentColor" strokeWidth="6" />
          <g fill="currentColor">
            <rect x="44" y="10" width="6" height="6" />
            <rect x="52" y="18" width="6" height="6" />
            <rect x="44" y="26" width="6" height="6" />
            <rect x="44" y="44" width="6" height="6" />
            <rect x="54" y="44" width="6" height="6" />
            <rect x="64" y="48" width="6" height="6" />
            <rect x="76" y="54" width="6" height="6" />
            <rect x="46" y="56" width="6" height="6" />
            <rect x="56" y="64" width="6" height="6" />
            <rect x="68" y="68" width="6" height="6" />
            <rect x="80" y="74" width="6" height="6" />
            <rect x="48" y="76" width="6" height="6" />
            <rect x="60" y="80" width="6" height="6" />
          </g>
        </svg>
      </div>
    </div>

    <div className="lp-passport__foot">
      Rogamos tengan en consideración las circunstancias que concurren en la persona
      portadora de este documento, conforme a la legislación vigente.
    </div>
  </div>
);

const Hero = () => {
  const loggedIn = useAuthStatus();
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: { staggerChildren: reduceMotion ? 0 : 0.08, delayChildren: 0.05 },
    },
  };
  const item = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      };

  return (
    <main className="lp-hero">
      <div className="lp-hero__bg" aria-hidden="true" />

      <section className="lp-hero__inner">
        <motion.div
          className="lp-hero__content"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p className="lp-hero__eyebrow" variants={item}>
            Registro Único Iberoamericano · DEA
          </motion.p>

          <motion.h1 className="lp-hero__title" variants={item}>
            El pasaporte oficial que acredita tu{" "}
            <span>Dificultad Específica del Aprendizaje</span>
          </motion.h1>

          <motion.p className="lp-hero__subtitle" variants={item}>
            RUIDEA es un documento digital verificado para que centros educativos,
            administraciones y autoridades reconozcan tu dislexia, discalculia,
            disortografía, dispraxia o TDA-H, conforme a la legislación vigente.
          </motion.p>

          <motion.div className="lp-hero__cta" variants={item}>
            <Link
              role="button"
              to={loggedIn ? "/dashboard" : "/inscribirse"}
              className="lp-btn lp-btn--primary"
              onClick={() => {
                ReactGA.event({
                  category: "NuevoUsuario",
                  action: "IniciarRegistro",
                  label: "hero_cta",
                  nonInteraction: false,
                });
              }}
            >
              {loggedIn ? "Ver mi solicitud" : "Inscribirme gratis"}
            </Link>
            <Link role="button" to="/verificar/numero" className="lp-btn lp-btn--ghost">
              Verificar un pasaporte
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="lp-hero__visual"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <PassportMockup />
        </motion.div>
      </section>
    </main>
  );
};

export default Hero;
