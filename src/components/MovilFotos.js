import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { BsCamera, BsImages, BsCheckCircle, BsArrowRepeat } from "react-icons/bs";

import { exchangeCode, isExpired, phoneSession, sendPhonePhoto } from "../util/phoneUpload";
import { shrinkPhoto } from "../util/documents";

import "../css/registration.scss";
import "../css/movil.scss";

// The phone side of "Hazles una foto con el móvil" (GON-78). Public: no sign-in, and it shows
// no name or other personal data, only what the person photographs. /movil asks for the
// 6-digit code; /movil/:token is the page the QR opens.

const PAPERS = [
  { grupo: "diagnostico", label: "Informe de diagnóstico", hint: "Una foto por cada página." },
  { grupo: "documento", label: "DNI, NIE o pasaporte", hint: "Una foto de cada cara." },
];
const labelOf = (grupo) => PAPERS.find((p) => p.grupo === grupo).label;

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

const serverMessage = (err) => {
  const message = err && err.response && err.response.data && err.response.data.message;
  return typeof message === "string" && message ? message : null;
};

const CodeForm = ({ onToken }) => {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const digits = codigo.replace(/\D/g, "");
    if (digits.length !== 6) {
      setError("El código tiene 6 números. Lo ves en el ordenador, en el paso Documentos.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { token } = await exchangeCode(digits);
      onToken(token);
    } catch (err) {
      setError(serverMessage(err) || "No hemos podido comprobar el código. Revisa la conexión e inténtalo otra vez.");
      setBusy(false);
    }
  };

  return (
    <form className="step-form" onSubmit={submit} noValidate>
      <p className="step-intro">Escribe los 6 números que ves en el ordenador, en el paso Documentos.</p>
      <div className={`field${error ? " has-error" : ""}`}>
        <label htmlFor="movil-codigo">Código</label>
        <input
          id="movil-codigo"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={9}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "movil-codigo-error" : undefined}
        />
        {error && (
          <span className="error-message" id="movil-codigo-error" role="alert">
            {error}
          </span>
        )}
      </div>
      <button type="submit" className="btn-primary movil-wide" disabled={busy}>
        {busy ? "Comprobando…" : "Continuar"}
      </button>
    </form>
  );
};

const Preview = ({ file }) => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url ? <img className="movil-preview" src={url} alt="La foto que acabas de hacer" /> : null;
};

const MovilFotos = ({ match, history }) => {
  const token = match.params.token;
  // checking | code | expired | offline | choose | take | preview | done
  const [screen, setScreen] = useState(token ? "checking" : "code");
  const [grupo, setGrupo] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState([]);
  const heading = useRef(null);

  useEffect(() => {
    if (!token) {
      setScreen("code");
      return undefined;
    }
    let active = true;
    setScreen("checking");
    phoneSession(token)
      .then(() => active && setScreen("choose"))
      .catch((err) => active && setScreen(isExpired(err) ? "expired" : "offline"));
    return () => {
      active = false;
    };
  }, [token]);

  // Each screen is a new step: move the focus to its title, so a screen reader reads it.
  useEffect(() => {
    if (heading.current) heading.current.focus();
  }, [screen]);

  const pick = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setPhoto(file);
    setScreen("preview");
  };

  const send = async () => {
    setSending(true);
    setError(null);
    try {
      await sendPhonePhoto(token, grupo, await shrinkPhoto(photo));
      setSent((list) => [...list, grupo]);
      setPhoto(null);
      setScreen("done");
    } catch (err) {
      if (isExpired(err)) setScreen("expired");
      else setError(serverMessage(err) || "No hemos podido enviar la foto. Revisa la conexión e inténtalo otra vez.");
    } finally {
      setSending(false);
    }
  };

  const titles = {
    checking: "Un momento…",
    code: "Haz las fotos con el móvil",
    expired: "Este enlace ha caducado",
    offline: "No hemos podido conectar",
    choose: "¿Qué papel vas a fotografiar?",
    take: grupo ? labelOf(grupo) : "",
    preview: "¿Se lee bien el texto?",
    done: "Listo. Ya están en tu ordenador.",
  };

  const counts = PAPERS.map((p) => ({ ...p, n: sent.filter((g) => g === p.grupo).length })).filter((p) => p.n > 0);

  return (
    <div className="reg movil">
      <Helmet>
        <title>Fotos desde el móvil | RUIDEA</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="reg-shell movil-shell">
        <h1 className="reg-title" tabIndex={-1} ref={heading}>
          {titles[screen]}
        </h1>
        <div className="reg-step movil-step">
          {screen === "code" && <CodeForm onToken={(t) => history.replace(`/movil/${t}`)} />}

          {screen === "expired" && (
            <div className="step-form">
              <p>
                Pide un código nuevo en el ordenador: en el paso Documentos, pulsa «Crear un código nuevo». Luego
                vuelve a escanear el QR o escribe el código aquí.
              </p>
              <button type="button" className="btn-primary movil-wide" onClick={() => history.replace("/movil")}>
                Escribir un código nuevo
              </button>
            </div>
          )}

          {screen === "offline" && (
            <div className="step-form">
              <p>Revisa la conexión del móvil e inténtalo otra vez.</p>
              <button type="button" className="btn-primary movil-wide" onClick={() => window.location.reload()}>
                <BsArrowRepeat aria-hidden="true" /> Intentarlo otra vez
              </button>
            </div>
          )}

          {screen === "choose" && (
            <div className="movil-papers">
              {PAPERS.map((p) => (
                <button
                  key={p.grupo}
                  type="button"
                  className="movil-paper"
                  onClick={() => {
                    setGrupo(p.grupo);
                    setScreen("take");
                  }}
                >
                  <strong>{p.label}</strong>
                  <span>{p.hint}</span>
                </button>
              ))}
            </div>
          )}

          {screen === "take" && (
            <div className="step-form">
              <p className="step-intro">
                {PAPERS.find((p) => p.grupo === grupo).hint} Pon el papel sobre una mesa, con buena luz y sin sombras.
              </p>
              <label className="btn-primary movil-wide movil-file">
                <BsCamera aria-hidden="true" /> Hacer la foto
                <input type="file" accept={ACCEPT} capture="environment" onChange={pick} />
              </label>
              <label className="btn-secondary movil-wide movil-file">
                <BsImages aria-hidden="true" /> Elegir una foto de la galería
                <input type="file" accept={ACCEPT} onChange={pick} />
              </label>
              <button type="button" className="movil-link" onClick={() => setScreen("choose")}>
                Elegir otro papel
              </button>
            </div>
          )}

          {screen === "preview" && photo && (
            <div className="step-form">
              <Preview file={photo} />
              <p>Si no se lee bien, repítela con más luz.</p>
              {error && (
                <span className="error-message" role="alert">
                  {error}
                </span>
              )}
              <button type="button" className="btn-primary movil-wide" onClick={send} disabled={sending}>
                {sending ? "Enviando…" : "Usar esta foto"}
              </button>
              <button type="button" className="btn-secondary movil-wide" onClick={() => setScreen("take")} disabled={sending}>
                Repetir
              </button>
            </div>
          )}

          {screen === "done" && (
            <div className="step-form">
              <ul className="movil-sent">
                {counts.map((p) => (
                  <li key={p.grupo}>
                    <BsCheckCircle aria-hidden="true" /> {p.label}: {p.n} {p.n === 1 ? "foto" : "fotos"}
                  </li>
                ))}
              </ul>
              <p className="field-hint">Puedes seguir en el ordenador. Las fotos ya están en la lista de documentos.</p>
              <button type="button" className="btn-primary movil-wide" onClick={() => setScreen("choose")}>
                <BsCamera aria-hidden="true" /> Hacer otra foto
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MovilFotos;
