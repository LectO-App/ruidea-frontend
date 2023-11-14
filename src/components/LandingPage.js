import React, { lazy, Suspense } from "react";

import LoadingScreen from "./LoadingScreen";

const Navbar = lazy(() => import("./Navbar"));
const Hero = lazy(() => import("./landing/Hero"));
const Info = lazy(() => import("./landing/Info"));
const Footer = lazy(() => import("./Footer"));
const Acknowledgements = lazy(() => import("./landing/Acknowledgements"));

const LandingPage = () => {
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <Navbar />
        <Hero />
        <hr />
        <Info />
        <Acknowledgements />
        <Footer />
      </Suspense>
    </>
  );
};

export default LandingPage;
