import React, { useMemo, useState } from "react";
import { BsCheckCircle } from "react-icons/bs";

// Phone with a country-code selector beside the number (REGISTRATION_UX.md §3): the user
// picks their country instead of us silently assuming +34. Outputs a full E.164 string
// ("+34600123123") which the backend (libphonenumber) accepts as-is. Self-contained and
// controlled — reports the combined value up via onChange.

// Spanish names, dial codes, ISO-2 (for the flag). España first, then alphabetical.
const COUNTRIES = [
  { iso: "ES", name: "España", dial: "34" },
  { iso: "AD", name: "Andorra", dial: "376" },
  { iso: "AR", name: "Argentina", dial: "54" },
  { iso: "BO", name: "Bolivia", dial: "591" },
  { iso: "BR", name: "Brasil", dial: "55" },
  { iso: "CL", name: "Chile", dial: "56" },
  { iso: "CO", name: "Colombia", dial: "57" },
  { iso: "CR", name: "Costa Rica", dial: "506" },
  { iso: "CU", name: "Cuba", dial: "53" },
  { iso: "EC", name: "Ecuador", dial: "593" },
  { iso: "SV", name: "El Salvador", dial: "503" },
  { iso: "US", name: "Estados Unidos", dial: "1" },
  { iso: "GT", name: "Guatemala", dial: "502" },
  { iso: "MX", name: "México", dial: "52" },
  { iso: "NI", name: "Nicaragua", dial: "505" },
  { iso: "PA", name: "Panamá", dial: "507" },
  { iso: "PY", name: "Paraguay", dial: "595" },
  { iso: "PE", name: "Perú", dial: "51" },
  { iso: "PT", name: "Portugal", dial: "351" },
  { iso: "DO", name: "República Dominicana", dial: "1809" },
  { iso: "UY", name: "Uruguay", dial: "598" },
  { iso: "VE", name: "Venezuela", dial: "58" },
];

const BY_ISO = COUNTRIES.reduce((acc, c) => ({ ...acc, [c.iso]: c }), {});

// ISO-2 -> flag emoji (regional indicator letters).
const flag = (iso) =>
  String.fromCodePoint(...iso.toUpperCase().split("").map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65));

// Split a stored "+34600123123" back into a country + national number for prefill. Picks
// the country with the longest matching dial prefix (so +1809… resolves before +1…).
const parseE164 = (value) => {
  const v = String(value || "").trim();
  if (!v) return { iso: "ES", national: "" };
  const digits = v.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) {
    const rest = digits.slice(1);
    const match = [...COUNTRIES]
      .sort((a, b) => b.dial.length - a.dial.length)
      .find((c) => rest.startsWith(c.dial));
    if (match) return { iso: match.iso, national: rest.slice(match.dial.length) };
  }
  return { iso: "ES", national: digits.replace(/^\+/, "") };
};

const PhoneField = ({ label = "Teléfono móvil", defaultValue, value, onChange, error, hint }) => {
  const parsed = useMemo(() => parseE164(defaultValue), [defaultValue]);
  const [iso, setIso] = useState(parsed.iso);
  const [national, setNational] = useState(parsed.national);

  const emit = (nextIso, nextNational) => {
    const dial = BY_ISO[nextIso].dial;
    const digits = String(nextNational).replace(/[^\d]/g, "");
    onChange(digits ? `+${dial}${digits}` : "");
  };

  const onIso = (e) => {
    setIso(e.target.value);
    emit(e.target.value, national);
  };
  const onNational = (e) => {
    setNational(e.target.value);
    emit(iso, e.target.value);
  };

  const valid = value && !error;

  return (
    <div className={`field${error ? " has-error" : ""}${valid ? " is-valid" : ""}`}>
      <label htmlFor="numeroTelefono">{label}</label>
      {hint && <p className="field-hint">{hint}</p>}
      <div className="phone-row">
        <select
          className="phone-cc"
          aria-label="País del teléfono"
          value={iso}
          onChange={onIso}
        >
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {flag(c.iso)} {c.name}
            </option>
          ))}
        </select>
        <div className="input-wrap phone-number">
          <span className="phone-prefix" aria-hidden="true">
            +{BY_ISO[iso].dial}
          </span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            id="numeroTelefono"
            name="numeroTelefono"
            value={national}
            onChange={onNational}
            aria-invalid={error ? "true" : "false"}
          />
          {valid && <BsCheckCircle className="valid-check" aria-hidden="true" />}
        </div>
      </div>
      {error && (
        <span className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default PhoneField;
