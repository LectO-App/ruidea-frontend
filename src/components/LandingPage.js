import React from "react";

// The whole landing is already a lazy() chunk in App.js, so its sections are imported
// directly (no nested Suspense / full-page bouncing-ball fallback). Navbar + Hero paint
// first as a cohesive above-the-fold unit.
import Navbar from "./Navbar";
import Hero from "./landing/Hero";
import About from "./landing/About";
import Steps from "./landing/Steps";
import Audience from "./landing/Audience";
import VerifySection from "./landing/VerifySection";
import Acknowledgements from "./landing/Acknowledgements";
import Faq from "./landing/Faq";
import CtaBand from "./landing/CtaBand";
import Footer from "./Footer";

const LandingPage = () => (
  <>
    <Navbar />
    <Hero />
    <About />
    <Steps />
    <Audience />
    <VerifySection />
    <Acknowledgements />
    <Faq />
    <CtaBand />
    <Footer />
  </>
);

export default LandingPage;
