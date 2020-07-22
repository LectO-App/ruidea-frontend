import React from "react";
import wave1 from "../img/waves1.svg";
import wave2 from "../img/waves2.svg";

const Hero = () => {
  return (
    <main>
      <section>
        <div className="hero">
          <div className="text">
            <h1>
              Lorem ipsum dolor sit amet consectetur
              <span> illum delectus. </span>
            </h1>
            <button className="btn-inscribirme">Inscribirme</button>
          </div>
          <div className="imagen"></div>
        </div>
      </section>
      <div className="waves">
        <img src={wave1} alt="" />
        <img src={wave2} alt="" className="second-wave" />
      </div>
    </main>
  );
};

export default Hero;
