import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import MathHeartScene from "./MathHeartScene";
import { bindScrollReveal } from "./utils/sectionReveal";
import "./styles/MathHeartSection.css";

const MathHeartSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const equationRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLParagraphElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const starRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const captionTlRef = useRef<gsap.core.Timeline | null>(null);
  const [active, setActive] = useState(false);

  const resetCaption = useCallback(() => {
    captionTlRef.current?.kill();
    captionTlRef.current = null;

    if (captionRef.current) {
      captionRef.current.classList.remove("math-heart-caption--revealed");
    }

    gsap.set(
      [captionRef.current, line1Ref.current, line2Ref.current, starRef.current],
      { clearProps: "all" }
    );
    gsap.set(captionRef.current, { opacity: 0 });
  }, []);

  const playCaption = useCallback(
    (reducedMotion: boolean) => {
      resetCaption();

      if (
        !captionRef.current ||
        !line1Ref.current ||
        !line2Ref.current ||
        !starRef.current
      ) {
        return;
      }

      if (reducedMotion) {
        gsap.set(captionRef.current, { opacity: 1 });
        captionRef.current.classList.add("math-heart-caption--revealed");
        return;
      }

      gsap.set(captionRef.current, { opacity: 1 });
      gsap.set(line1Ref.current, {
        opacity: 0,
        y: 28,
        filter: "blur(10px)",
      });
      gsap.set(line2Ref.current, {
        opacity: 0,
        y: 24,
        filter: "blur(10px)",
      });
      gsap.set(starRef.current, {
        opacity: 0,
        scale: 0,
        rotate: -120,
        filter: "blur(8px)",
      });

      captionTlRef.current = gsap
        .timeline({ delay: 1.15 })
        .to(line1Ref.current, {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.05,
          ease: "power4.out",
        })
        .to(
          starRef.current,
          {
            opacity: 1,
            scale: 1,
            rotate: 0,
            filter: "blur(0px)",
            duration: 0.75,
            ease: "back.out(2.8)",
          },
          "-=0.45"
        )
        .to(
          line2Ref.current,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.95,
            ease: "power3.out",
          },
          "-=0.25"
        )
        .to(
          captionRef.current,
          {
            duration: 0.01,
            onComplete: () => {
              captionRef.current?.classList.add("math-heart-caption--revealed");
            },
          },
          "-=0.2"
        )
        .fromTo(
          captionRef.current,
          {
            textShadow:
              "0 0 10px rgba(255,77,109,0.15), 0 0 24px rgba(255,77,109,0.06)",
          },
          {
            textShadow:
              "0 0 18px rgba(255,77,109,0.42), 0 0 42px rgba(255,120,150,0.22)",
            duration: 1.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
          },
          "-=0.15"
        );
    },
    [resetCaption]
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    return bindScrollReveal(
      section,
      () => [
        {
          el: equationRef.current,
          enterFrom: {
            opacity: 0,
            y: 28,
            filter: "blur(8px)",
          },
          enterTo: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power4.out",
          },
          position: 0,
        },
        {
          el: canvasRef.current,
          enterFrom: {
            opacity: 0,
            scale: 0.92,
            filter: "blur(6px)",
          },
          enterTo: {
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.05,
            ease: "power3.out",
          },
          position: 0.28,
        },
      ],
      {
        threshold: 0.28,
        onEnter: () => {
          playCaption(prefersReducedMotion);

          if (prefersReducedMotion) {
            setActive(true);
            return;
          }

          window.setTimeout(() => {
            setActive(true);
          }, 900);
        },
        onLeave: () => {
          resetCaption();
          setActive(false);
        },
      }
    );
  }, [playCaption, resetCaption]);

  useEffect(() => () => resetCaption(), [resetCaption]);

  return (
    <section
      id="birthday-math-heart"
      ref={sectionRef}
      className="math-heart-section"
      aria-labelledby="math-heart-equation"
    >
      <div className="math-heart-container">
        <div
          id="math-heart-equation"
          ref={equationRef}
          className="math-heart-equation"
          aria-label="(x squared plus y squared minus 1) cubed minus x squared y cubed equals zero"
        >
          <span className="math-heart-equation__paren">(</span>
          <span>
            x<sup>2</sup> + y<sup>2</sup> − 1
          </span>
          <span className="math-heart-equation__paren">)</span>
          <sup>3</sup>
          <span className="math-heart-equation__minus">{" − "}</span>
          <span>
            x<sup>2</sup>y<sup>3</sup>
          </span>
          <span className="math-heart-equation__equals">{" = 0"}</span>
        </div>

        <div ref={canvasRef} className="math-heart-canvas">
          <MathHeartScene active={active} />
          <span className="math-heart-axis math-heart-axis--x">x</span>
          <span className="math-heart-axis math-heart-axis--y">y</span>
        </div>

        <p ref={captionRef} className="math-heart-caption">
          <span ref={line1Ref} className="math-heart-caption__line">
            منحنی کهکشان تابع ابروی توست
          </span>
          <span ref={starRef} className="math-heart-caption__star" aria-hidden="true">
            ✦
          </span>
          <span ref={line2Ref} className="math-heart-caption__line math-heart-caption__line--soft">
            خط مجانب بر آن، طُرّهٔ گیسوی توست
          </span>
        </p>
      </div>
    </section>
  );
};

export default MathHeartSection;
