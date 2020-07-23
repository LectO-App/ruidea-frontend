import React from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Info from "./components/Info";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Info />
      <Footer />
      <Dashboard />
    </div>
  );
}

export default App;
