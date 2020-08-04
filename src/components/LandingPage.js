import React from "react";

import Navbar from "./Navbar";
import Hero from "./Hero";
import Info from "./Info";
import Footer from "./Footer";

const LandingPage = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <hr />
      <Info />
      <Footer />
    </>
  );
};

export default LandingPage;
