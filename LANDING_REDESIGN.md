# Landing page redesign — review spec

The public landing (`src/components/LandingPage.js` and `src/components/landing/*`) was built in
2020 and never received the design-system refresh that registration / auth / dashboard got. It leads
with the registry's legal name instead of a value proposition, hides the government backing at the
bottom, offers no path for the "verify a passport" audience, and uses pure-black text + decorative
"waves" that read as dated. This document is the agreed change list.

## Locked decisions (2026-06-14)

1. Product imagery — **we generate it ourselves** (code-built passport mockup, no external asset).
2. Cost — **registration is free**. Say so in the hero.
3. Coverage — **all Iberoamerican countries**.
4. The authority "Verificar un pasaporte" flow is a **secondary** CTA, not co-equal with Inscribirme.
5. Visual direction — **open to a full redesign** (keep the teal brand, modernize everything else).

## Audiences

- **Primary** — a person with a DEA (or their family) who wants to register and obtain the passport.
- **Secondary** — an authority / institution who needs to verify a passport (web or QR).

## Target information architecture

1. **Hero** — benefit headline + subhead + dual CTA (`Inscribirme gratis` / `Verificar un pasaporte`)
   + "gratis · todos los países iberoamericanos" note + inline trust strip + code-built passport mockup.
2. **¿Qué es RUIDEA? / the passport** — show the product, explain the document.
3. **¿Cómo funciona?** — 3 visual numbered steps (not 3 paragraphs of prose).
4. **¿Para quién es?** — the five DEAs (dislexia, discalculia, disortografía, dispraxia, TDA-H) as chips/cards.
5. **Para autoridades** — verify-a-passport section + the QR story.
6. **Con el apoyo de** — partner logos elevated as social proof, with a line on what the backing means.
7. **FAQ** — gratis, qué países, qué documentos necesito, cuánto tarda, validez/renovación.
8. **CTA band** — repeat the primary action.
9. **Footer** — same links, dynamic copyright year.

## Content changes

- [ ] Hero `<h1>` becomes a benefit statement, not the legal name. Draft:
      *"El pasaporte oficial que acredita tu Dificultad Específica del Aprendizaje."*
- [ ] Add hero subhead explaining what the document does and which DEAs it covers.
- [ ] Add the secondary `Verificar un pasaporte` CTA (→ `/verificar/numero`).
- [ ] Surface "Gratuito · Para todos los países iberoamericanos" in the hero.
- [ ] Pull trust signals (OEI, Ministerios, DGT, Guardia Civil, Air Europa) up to the hero.
- [ ] Convert "¿Cómo funciona?" prose into 3 numbered steps with icons.
- [ ] Add "¿Para quién es?" DEA chips.
- [ ] Add an FAQ answering cost / countries / documents / turnaround / validity.
- [ ] Visualize the QR / verification story for authorities.

## Visual / engineering changes

- [ ] Adopt the `$reg-*` tokens on the landing (off-white bg, softer-than-black ink for dyslexic readers).
- [ ] Replace the decorative `waves` SVGs with a calm modern backdrop.
- [ ] Replace the hero logo image with a product-forward visual (the passport mockup).
- [ ] Real type scale + spacing rhythm (`clamp()`), `-webkit-font-smoothing: antialiased`.
- [ ] Depth via soft shadows + hairline borders + `$reg-radius`, not flat color blocks.
- [ ] Restrained entrance motion via the already-installed framer-motion; honor `prefers-reduced-motion`.
      No scroll-hijack, no parallax, no auto-carousels.
- [ ] CTA hover + press states; standard easing `cubic-bezier(0.16,1,0.3,1)`.
- [ ] Eager-render Navbar + Hero; lazy-load below-fold sections; skeleton instead of the bouncing-ball loader.
- [ ] Keep the brand wordmark visible on mobile.
- [ ] Unify the `Inscribirme` CTA styling (hero vs footer).
- [ ] One `<h1>` per page; section titles become `<h2>`.
- [ ] Replace the `#que-es-ruidea` offset div hack with `scroll-margin-top`.
- [ ] Dynamic copyright year (currently hardcoded `© 2023`).
- [ ] Fix the placeholder GA event payload in the hero.

## Accessibility / polish

- [ ] `:focus-visible` on CTA, nav links, logo links.
- [ ] 44px minimum tap targets on nav/footer links.
- [ ] `text-wrap: balance` on headings, `text-wrap: pretty` on body.
- [ ] Subtle inset outline on logos/images for depth.

## Status

- [x] **Hero** — rebuilt (`Hero.js` + `hero.scss`): benefit copy, dual CTA, free badge, trust strip,
      code-built landscape PASAPORTE DEA mock (matches `backend/functions/passportTemplate.js`).
- [x] **¿Qué es RUIDEA?** — `landing/About.js` (anchor target, `scroll-margin-top`).
- [x] **¿Cómo funciona?** — `landing/Steps.js`, 3 numbered icon cards.
- [x] **¿Para quién es?** — `landing/Audience.js`, the 5 DEAs as cards.
- [x] **Para autoridades** — `landing/VerifySection.js`, verify-by-number / QR + example link.
- [x] **Con el apoyo de** — `landing/Acknowledgements.js`, grayscale→color logos + context line.
- [x] **FAQ** — `landing/Faq.js`, native `<details>` (gratis, países, documentos, plazo, verificación).
- [x] **CTA band** — `landing/CtaBand.js`.
- [x] **LandingPage** — assembles sections, eager-rendered (no nested bouncing-ball Suspense).
- [x] **Footer** — dynamic year, unified `Inscribirme gratis` CTA button.
- [x] **Navbar** — brand wordmark kept visible on mobile.
- [x] All new sections on `$reg-*` tokens; `src/css/landing.scss`. No scroll animations.

### Not yet done / follow-ups
- [ ] Remove now-dead `landing/Info.js`, `src/css/info.scss`, `src/css/acknowledgements.scss`.
- [ ] App-level: the landing chunk still shows the global `LoadingScreen` while it loads
      (separate from the in-page fix) — consider a hero-shaped skeleton.
- [ ] Real partner logos are full-color PNGs; grayscale filter applied — confirm legibility.
- [ ] Visual QA pass on mobile breakpoints.
