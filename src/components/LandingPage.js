import React, { useState, useEffect } from "react";

import Navbar from "./Navbar";
import Hero from "./landing/Hero";
import Info from "./landing/Info";
import Footer from "./Footer";
import LoadingScreen from "./LoadingScreen";

import { motion } from "framer-motion";

const LandingPage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <motion.div
      exit={{ ease: "linear", transform: "translateX(-100vw)" }}
      animate={{ ease: "linear", transform: "translateX(0vw)" }}
      initial={{ ease: "linear", transform: "translateX(-100vw)" }}
      transition={{ ease: "linear", default: { duration: 0.2 } }}
    >
      {loading && <LoadingScreen />}
      <Navbar />
      <div id="que-es-ruidea"></div>
      <Hero />
      <hr />
      <Info />
      <Footer />
    </motion.div>
  );
};

export default LandingPage;
