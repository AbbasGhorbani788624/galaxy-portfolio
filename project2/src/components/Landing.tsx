import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>To someone who sparks ideas</h2>
            <h1>
              SHAKILA
              <br />
              <span>✦</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>Hardworking AI Engineer &</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-1">Dedicated</div>
              <div className="landing-h2-2">Brilliant</div>
            </h2>
            <h2>
              <div className="landing-h2-info">Brilliant</div>
              <div className="landing-h2-info-1">Dedicated</div>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
