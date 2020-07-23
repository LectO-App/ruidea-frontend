import React from "react";
import "./css/style.scss";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Info from "./components/Info";

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Info />
    </div>
  );
}

export default App;
