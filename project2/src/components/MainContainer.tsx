import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import setSplitText from "./utils/splitText";
import { initScrollSmoother, isMonitorEmbed } from "./utils/scrollSmoother";

const MoonHub = lazy(() => import("./MoonHub"));
const ShakilaSpotlight = lazy(() => import("./ShakilaSpotlight"));
const MathHeartSection = lazy(() => import("./MathHeartSection"));
const BirthdayCake = lazy(() => import("./BirthdayCake"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    if (isMonitorEmbed()) {
      document.documentElement.classList.add("monitor-embed");
    }
    initScrollSmoother();

    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, [isDesktopView]);

  return (
    <div className="container-main">
      <Cursor />
      <SocialIcons />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            {isDesktopView && (
              <Suspense fallback={<div>Loading....</div>}>
                <MoonHub />
                <ShakilaSpotlight />
                <MathHeartSection />
                <BirthdayCake />
              </Suspense>
            )}
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
