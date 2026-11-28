import React, { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { BsPhone, BsArrowRepeat } from "react-icons/bs";

import { createPhoneLink, listStaged, phoneAddress, phoneLink, POLL_MS } from "../../util/phoneUpload";

const GROUP_LABEL = { diagnostico: "Informe de diagnóstico", documento: "DNI, NIE o pasaporte" };

const minutesLeft = (caduca, now) => Math.max(0, Math.ceil((new Date(caduca).getTime() - now) / 60000));

// "Hazles una foto con el móvil" (GON-78): a QR and, to type instead, a short address and a
// 6-digit code (numbers only, easier to copy for dyslexic readers). While the code is live the
// card asks every few seconds for the photos the phone sent and hands them to onStaged; it
// asks once on opening too, so photos sent before a reload come back.
const PhoneUploadCard = ({ onStaged, pollMs = POLL_MS }) => {
  const [link, setLink] = useState(null);
  const [failed, setFailed] = useState(false);
  const [qrSrc, setQrSrc] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const [connected, setConnected] = useState(false);
  const [arrival, setArrival] = useState("");
  const seen = useRef(null);

  const expired = Boolean(link) && minutesLeft(link.caduca, now) === 0;

  const newLink = useCallback(async () => {
    setFailed(false);
    try {
      const created = await createPhoneLink();
      setNow(Date.now());
      setConnected(false);
      setLink(created);
    } catch (err) {
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    newLink();
  }, [newLink]);

  useEffect(() => {
    if (!link) return undefined;
    let active = true;
    QRCode.toString(phoneLink(link.token), {
      type: "svg",
      margin: 4,
      errorCorrectionLevel: "M",
      color: { dark: "#2b2b33", light: "#ffffff" },
    }).then((svg) => active && setQrSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`));
    return () => {
      active = false;
    };
  }, [link]);

  const check = useCallback(async () => {
    let data;
    try {
      data = await listStaged();
    } catch (err) {
      return; // the next round asks again
    }
    const first = seen.current === null;
    const fresh = first ? [] : data.archivos.filter((a) => !seen.current.has(a.id));
    seen.current = new Set(data.archivos.map((a) => a.id));
    setConnected(data.movilConectado);
    onStaged(data.archivos, { refresh: first });
    if (fresh.length) {
      const last = fresh[fresh.length - 1];
      setArrival(
        fresh.length === 1
          ? `Ha llegado una foto del móvil: ${GROUP_LABEL[last.grupo]}.`
          : `Han llegado ${fresh.length} fotos del móvil.`
      );
    }
  }, [onStaged]);

  useEffect(() => {
    check();
  }, [check]);

  useEffect(() => {
    if (!link || expired) return undefined;
    const poll = setInterval(check, pollMs);
    const clock = setInterval(() => setNow(Date.now()), Math.min(pollMs, 15000));
    return () => {
      clearInterval(poll);
      clearInterval(clock);
      check(); // a photo sent in the last seconds still shows up
    };
  }, [link, expired, check, pollMs]);

  const minutes = link ? minutesLeft(link.caduca, now) : 0;
  const code = link ? `${link.codigo.slice(0, 3)} ${link.codigo.slice(3)}` : "";

  return (
    <section className="phone-card" aria-labelledby="phone-card-title">
      <h2 className="phone-card-title" id="phone-card-title">
        <BsPhone aria-hidden="true" /> ¿Tienes los papeles a mano? Hazles una foto con el móvil
      </h2>

      {failed && (
        <div className="phone-card-body">
          <p className="field-hint">
            Ahora no podemos preparar el código para el móvil. Puedes elegir los archivos aquí abajo.
          </p>
          <button type="button" className="btn-secondary" onClick={newLink}>
            <BsArrowRepeat aria-hidden="true" /> Intentarlo otra vez
          </button>
        </div>
      )}

      {link && !expired && (
        <div className="phone-card-body">
          <div className="phone-card-steps">
            <ol>
              <li>Abre la cámara del móvil y apunta a este código.</li>
              <li>Haz las fotos en el móvil. Aparecen aquí solas.</li>
            </ol>
            <p className="phone-card-alt">
              ¿No se abre? En el navegador del móvil, escribe <strong className="phone-address">{phoneAddress()}</strong>{" "}
              y este código:
            </p>
            <p className="phone-code">{code}</p>
            <p className="field-hint">
              El código caduca en {minutes} {minutes === 1 ? "minuto" : "minutos"}.
            </p>
          </div>
          {qrSrc && <img className="phone-qr" src={qrSrc} alt="Código QR que abre la página de fotos en el móvil" />}
        </div>
      )}

      {link && expired && (
        <div className="phone-card-body">
          <p>El código ha caducado. Si quieres hacer más fotos con el móvil, crea uno nuevo.</p>
          <button type="button" className="btn-secondary" onClick={newLink}>
            <BsArrowRepeat aria-hidden="true" /> Crear un código nuevo
          </button>
        </div>
      )}

      <p className="phone-live" role="status" aria-live="polite">
        {connected && !expired ? "Móvil conectado. Las fotos aparecen aquí solas." : ""}
      </p>
      <p className="visually-hidden" role="status" aria-live="polite">
        {arrival}
      </p>
    </section>
  );
};

export default PhoneUploadCard;
