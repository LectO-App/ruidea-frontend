import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BsCheckCircle, BsCloudUpload, BsExclamationCircle } from "react-icons/bs";

import PasoCuenta from "./PasoCuenta";
import PasoDatos from "./PasoDatos";
import PasoResidencia from "./PasoResidencia";
import PasoDiagnostico from "./PasoDiagnostico";
import PasoDocumentos from "./PasoDocumentos";
import PasoRevision from "./PasoRevision";
import Completion from "./Completion";
import RegistrationSkeleton from "./RegistrationSkeleton";

import {
  getOwn,
  startDraft,
  patchDraft,
  submitDraft,
  registerOneShot,
  updateOwn,
  uploadFiles,
} from "../util/registrationApi";

import "../css/registration.scss";

// The registration lifecycle (REGISTRATION_UX.md §1): create the account in one short
// step, then fill the application across resumable steps that autosave to the server,
// then submit for review and land on a real "what happens next" moment.
const STEPS = [
  { key: "cuenta", title: "Crear cuenta", Component: PasoCuenta, accountOnly: true },
  { key: "datos", title: "Tus datos", Component: PasoDatos },
  { key: "residencia", title: "Residencia y documento", Component: PasoResidencia },
  { key: "diagnostico", title: "Diagnóstico", Component: PasoDiagnostico },
  { key: "documentos", title: "Documentos", Component: PasoDocumentos },
  { key: "revision", title: "Revisar y enviar", Component: PasoRevision },
];

// Which step owns each server-validated field, so a backend validation error (e.g. a phone
// the lenient client check let through) can be shown on the right field instead of a vague
// "go back and check" banner.
const STEP_FOR_PATH = {
  nombre: "datos",
  apellidos: "datos",
  fechaNacimiento: "datos",
  tutorNombre: "datos",
  tutorApellidos: "datos",
  tutorParentesco: "datos",
  paisResidencia: "residencia",
  localidadResidencia: "residencia",
  lugarNacimiento: "residencia",
  tipoDocumento: "residencia",
  numeroDocumento: "residencia",
  numeroTelefono: "residencia",
};

const Form = (props) => {
  const reduceMotion = useReducedMotion();

  const [loaded, setLoaded] = useState(false);
  const [editing, setEditing] = useState(false); // editing an already-submitted record
  const [draftId, setDraftId] = useState(null); // server-side resumable draft id
  const [skipAccount, setSkipAccount] = useState(false); // account already exists
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({ diagnostico: [], documento: [] });

  const [index, setIndex] = useState(0); // index into `steps`
  const [direction, setDirection] = useState(1);
  const [completion, setCompletion] = useState(null);
  const [serverErrors, setServerErrors] = useState(null); // field errors returned by the server on submit
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved | error — autosave feedback

  // When the user arrives here from a "needs revision" dashboard, carry the specialist's
  // message along so it stays in front of them while they fix the form (instead of being
  // left behind on the dashboard).
  const revisionMessage = props.location && props.location.state && props.location.state.mensajeMedico;

  // The account step disappears once the account exists. `skipAccount` is stable for the
  // rest of the session (not derived from draftId mid-flow) so dropping the step never
  // shifts the indices of the steps that follow.
  const steps = useMemo(() => STEPS.filter((s) => !(s.accountOnly && skipAccount)), [skipAccount]);

  useEffect(() => {
    const init = async () => {
      const me = await getOwn();
      if (me && me._id) {
        setFormData(me);
        setSkipAccount(true);
        if (me.estado === "borrador") {
          setDraftId(me._id); // resume an in-progress draft (account already created)
        } else {
          setEditing(true); // editing an existing submitted record (§1.5)
        }
      }
      setLoaded(true);
    };
    init();
  }, []);

  const current = steps[index];

  const mergeData = (patch) => {
    const next = { ...formData, ...patch };
    setFormData(next);
    return next;
  };

  // Persist this step to the server draft (autosave). Best-effort: a failed save never
  // blocks the user — the data is also held in state and re-sent on submit (§1, §4). The
  // save state drives a quiet indicator so the "we save your progress" promise is visible,
  // and a dropped save is surfaced honestly (patchDraft resolves null on failure).
  const autosave = async (patch) => {
    if (!draftId) return;
    setSaveState("saving");
    const ok = await patchDraft(draftId, patch);
    setSaveState(ok ? "saved" : "error");
  };

  const goTo = (newIndex) => {
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const onNext = (patch = {}, opts = {}) => {
    mergeData(patch);
    if (!opts.skipAutosave) autosave(patch);
    if (index < steps.length - 1) goTo(index + 1);
  };

  const onBack = (patch = {}) => {
    mergeData(patch);
    if (index > 0) goTo(index - 1);
  };

  // Account step: create the draft account, capture its id, then advance. Dropping the
  // account step renumbers the list, so the next step ("datos") becomes index 0.
  const onAccountCreated = async ({ correoElectronico, password }) => {
    const res = await startDraft({ correoElectronico, password });
    setDraftId(res.id);
    setSkipAccount(true);
    mergeData({ correoElectronico, _id: res.id });
    setDirection(1);
    setIndex(0);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const jumpToStep = (key) => {
    const i = steps.findIndex((s) => s.key === key);
    if (i >= 0) goTo(i);
  };

  // Final submission. Editing -> PUT actualizar; new/draft -> POST enviar. Documents are
  // uploaded to the authenticated endpoint (a session exists since the account step).
  const onSubmit = async () => {
    const fileGroups = {};
    if (files.diagnostico.length) fileGroups["Diagnostico Medico - Archivo"] = files.diagnostico;
    if (files.documento.length) fileGroups["Documento Identidad - Archivo"] = files.documento;
    const hasFiles = Object.keys(fileGroups).length > 0;

    try {
      if (editing) {
        if (hasFiles) await uploadFiles(fileGroups);
        const payload = { ...formData };
        delete payload.csrfToken;
        if (!payload.password) delete payload.password;
        await updateOwn(payload);
        setCompletion({
          editing: true,
          mensaje: "Hemos guardado tus cambios",
          pasos: ["revision-medica", "pasaporte-emitido"],
          siguientePaso: "revision-medica",
        });
        return;
      }

      // Send the full application at submit time too — autosave is best-effort, so this
      // guarantees the server validates against complete data even if a PATCH was dropped.
      const finalFields = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        paisResidencia: formData.paisResidencia,
        localidadResidencia: formData.localidadResidencia,
        lugarNacimiento: formData.lugarNacimiento,
        tipoDocumento: formData.tipoDocumento,
        numeroDocumento: formData.numeroDocumento,
        fechaNacimiento: formData.fechaNacimiento,
        correoElectronico: formData.correoElectronico,
        numeroTelefono: formData.numeroTelefono,
        diagnostico: formData.diagnostico,
        esTutor: formData.esTutor,
        tutorNombre: formData.tutorNombre,
        tutorApellidos: formData.tutorApellidos,
        tutorParentesco: formData.tutorParentesco,
        aceptoRecibirInfo: formData.aceptoRecibirInfo,
        aceptoSolicitud: formData.aceptoSolicitud,
      };

      let result;
      if (draftId) {
        if (hasFiles) await uploadFiles(fileGroups);
        result = await submitDraft(draftId, finalFields);
      } else {
        // Fallback: no draft was created (shouldn't normally happen) — one-shot register.
        result = await registerOneShot(formData);
        if (hasFiles) await uploadFiles(fileGroups);
      }
      setCompletion(result);
    } catch (err) {
      // Field-level validation from the server (e.g. an invalid phone the lenient client
      // check let through): show each message on its own field and take the user to the
      // step that owns the first error — never a dead-end generic banner.
      const fieldErrors = err && err.response && err.response.data && err.response.data.errors;
      if (Array.isArray(fieldErrors) && fieldErrors.length) {
        setServerErrors(fieldErrors);
        const target = steps.map((s) => s.key).find((key) => fieldErrors.some((e) => STEP_FOR_PATH[e.path] === key));
        if (target) {
          jumpToStep(target);
          return;
        }
        // Nothing maps to an editable field — surface the specific messages on the banner.
        throw new Error(fieldErrors.map((e) => e.message).join(" "));
      }
      throw new Error(
        "No hemos podido enviar tu solicitud. Tus datos están guardados; inténtalo otra vez en un momento."
      );
    }
  };

  if (!loaded) return <RegistrationSkeleton />;

  if (completion) {
    return <Completion data={completion} reduceMotion={reduceMotion} historyPush={props.history.push} />;
  }

  const StepComponent = current.Component;
  const totalForUser = steps.length;
  const variants = reduceMotion
    ? { enter: { opacity: 1 }, center: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
      };

  return (
    <motion.div
      className="reg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Helmet>
        <meta charSet="utf-8" />
        <title>Inscribirse | RUIDEA</title>
      </Helmet>

      <Link className="reg-close" to="/" aria-label="Cerrar y volver al inicio" role="button" />

      <div className="reg-shell">
        {revisionMessage && (
          <div className="status-note reg-revision-note">
            <span className="status-note-label">Mensaje del especialista</span>
            <p>{revisionMessage}</p>
          </div>
        )}

        <header className="reg-progress">
          <div className="reg-progress-meta">
            <p className="reg-step-count">
              Paso{" "}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={index}
                  className="reg-step-num"
                  initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                >
                  {index + 1}
                </motion.span>
              </AnimatePresence>{" "}
              de {totalForUser}
            </p>
            {draftId && saveState !== "idle" && (
              <span className={`reg-save reg-save-${saveState}`} role="status" aria-live="polite">
                {saveState === "saving" && (
                  <>
                    <BsCloudUpload aria-hidden="true" /> Guardando…
                  </>
                )}
                {saveState === "saved" && (
                  <>
                    <BsCheckCircle aria-hidden="true" /> Guardado
                  </>
                )}
                {saveState === "error" && (
                  <>
                    <BsExclamationCircle aria-hidden="true" /> Lo guardaremos al enviar
                  </>
                )}
              </span>
            )}
          </div>
          <div className="reg-bar" role="progressbar" aria-valuemin={1} aria-valuemax={totalForUser} aria-valuenow={index + 1}>
            <span className="reg-bar-fill" style={{ width: `${((index + 1) / totalForUser) * 100}%` }} />
          </div>
          <h1 className="reg-title">{current.title}</h1>
        </header>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={current.key}
            className="reg-step"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <StepComponent
              formData={formData}
              files={files}
              setFiles={setFiles}
              editing={editing}
              isFirst={index === 0}
              serverErrors={serverErrors}
              onNext={onNext}
              onBack={onBack}
              onAccountCreated={onAccountCreated}
              onSubmit={onSubmit}
              jumpToStep={jumpToStep}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Form;
