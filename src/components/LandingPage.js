import React, { lazy, Suspense } from "react";

/* import Navbar from "./Navbar";
import Hero from "./landing/Hero";
import Info from "./landing/Info";
import Footer from "./Footer"; */
import LoadingScreen from "./LoadingScreen";

import { motion } from "framer-motion";

const Navbar = lazy(() => import("./Navbar"));
const Hero = lazy(() => import("./landing/Hero"));
const Info = lazy(() => import("./landing/Info"));
const Footer = lazy(() => import("./Footer"));

const LandingPage = () => {
  return (
    <motion.div
      exit={{ ease: "linear", transform: "translateX(-100vw)" }}
      animate={{ ease: "linear", transform: "translateX(0vw)" }}
      initial={{ ease: "linear", transform: "translateX(-100vw)" }}
      transition={{ ease: "linear", default: { duration: 0.2 } }}
    >
      <Suspense fallback={<LoadingScreen />}>
        <Navbar />
        <Hero />
        <hr />
        <Info />
        <Footer />
      </Suspense>
    </motion.div>
  );
};

export default LandingPage;
