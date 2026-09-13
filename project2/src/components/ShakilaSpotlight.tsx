import { useEffect, useRef } from "react";
import { assetUrl } from "../utils/assetUrl";
import { bindScrollReveal } from "./utils/sectionReveal";
import "./styles/ShakilaSpotlight.css";

const PORTRAIT_SRC = assetUrl("/shakila.png");

const ShakilaSpotlight = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    return bindScrollReveal(
      section,
      () => [
        {
          el: titleRef.current,
          enterFrom: {
            opacity: 0,
            y: 64,
            scale: 0.94,
            filter: "blur(12px)",
          },
          enterTo: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 1,
            ease: "power4.out",
          },
          position: 0,
        },
        {
          el: subtitleRef.current,
          enterFrom: { opacity: 0, y: 36, x: -18 },
          enterTo: {
            opacity: 1,
            y: 0,
            x: 0,
            duration: 0.85,
            ease: "power3.out",
          },
          position: 0.14,
        },
        {
          el: visualRef.current,
          enterFrom: {
            opacity: 0,
            y: 80,
            scale: 0.84,
            rotateX: 10,
            filter: "blur(10px)",
          },
          enterTo: {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 1.15,
            ease: "back.out(1.25)",
          },
          position: 0.26,
        },
      ],
      { threshold: 0.18 }
    );
  }, []);

  return (
    <section
      id="shakila-spotlight"
      ref={sectionRef}
      className="shakila-spotlight"
      aria-labelledby="shakila-spotlight-heading"
    >
      <div className="shakila-spotlight__inner">
        <div className="shakila-spotlight__content">
          <h2
            id="shakila-spotlight-heading"
            ref={titleRef}
            className="shakila-spotlight__title"
          >
            You flow with <span>nature.</span>
          </h2>
          <p ref={subtitleRef} className="shakila-spotlight__subtitle">
            I&apos;m not saying NASA found you in nature — but I&apos;m not
            denying it either.
          </p>
        </div>

        <div ref={visualRef} className="shakila-spotlight__visual">
          <div className="shakila-spotlight__portrait">
            <div className="shakila-spotlight__image-main">
              <img
                src={PORTRAIT_SRC}
                alt="Shakila"
                className="shakila-spotlight__image"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="shakila-spotlight__reflection" aria-hidden="true">
              <img
                src={PORTRAIT_SRC}
                alt=""
                className="shakila-spotlight__image shakila-spotlight__image--reflect"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShakilaSpotlight;
