import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import BirthdayCakeScene from "./BirthdayCakeScene";
import {
  BIRTHDAY_BLOW_WORD,
  BIRTHDAY_VIDEO_SRC,
  BLOW_VIDEO_DELAY,
  isValidBlowInput,
  normalizeBlowInput,
} from "../config/birthdayCake";
import { bindScrollReveal, ScrollRevealItem } from "./utils/sectionReveal";
import "./styles/BirthdayCake.css";

const FUNNY_MESSAGES = [
  "Even a queen's cake has rules — type the magic word!",
  "The crown wobbled… that is not the secret word!",
  "The pearls on the tiers are unimpressed. Try again!",
  "Royal frosting says no. Whisper فوت instead!",
  "Shakila's wish is still glowing… one special word only!",
  "Wrong spell! Palace magic is very particular.",
  "The golden flames flickered in disagreement. Once more!",
];

const BirthdayCake = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);
  const videoOverlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputPanelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const blownRef = useRef(false);
  const showVideoRef = useRef(false);

  const [blown, setBlown] = useState(false);
  const [inputLocked, setInputLocked] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [hasError, setHasError] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const triggerBlow = useCallback(() => {
    if (blownRef.current) return;
    blownRef.current = true;
    setInputLocked(true);
    setBlown(true);
    setFeedback("");
    setHasError(false);

    if (inputPanelRef.current) {
      gsap.to(inputPanelRef.current, {
        opacity: 0,
        y: 16,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          inputPanelRef.current!.style.visibility = "hidden";
        },
      });
    }
  }, []);

  const handleWrongInput = useCallback((value: string) => {
    if (!value) {
      setHasError(true);
      setFeedback("Do not leave the candles hanging — type something!");
      return;
    }

    setHasError(true);
    setFeedback(
      FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]
    );
    setInputValue("");
  }, []);

  const evaluateInput = useCallback(
    (raw: string) => {
      if (blownRef.current || inputLocked) return;

      const value = normalizeBlowInput(raw);
      if (!value) return;

      if (isValidBlowInput(value)) {
        triggerBlow();
        return;
      }

      handleWrongInput(value);
    },
    [handleWrongInput, inputLocked, triggerBlow]
  );

  const playVideo = useCallback(() => {
    setShowVideo(true);
  }, []);

  const handleSequenceComplete = useCallback(() => {
    window.setTimeout(playVideo, BLOW_VIDEO_DELAY * 1000);
  }, [playVideo]);

  useEffect(() => {
    showVideoRef.current = showVideo;
  }, [showVideo]);

  useEffect(() => {
    if (!showVideo || !videoOverlayRef.current) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (canvasWrapRef.current) {
      gsap.to(canvasWrapRef.current, {
        opacity: 0,
        scale: 0.96,
        duration: 0.55,
        ease: "power2.inOut",
        onComplete: () => {
          if (canvasWrapRef.current) {
            canvasWrapRef.current.style.visibility = "hidden";
          }
        },
      });
    }

    gsap.fromTo(
      videoOverlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    const playTimer = window.setTimeout(() => {
      videoRef.current?.play().catch(() => setAutoplayBlocked(true));
    }, 450);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(playTimer);
    };
  }, [showVideo]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    return bindScrollReveal(
      section,
      () => {
        const items: ScrollRevealItem[] = [
          {
            el: headerRef.current,
            enterFrom: {
              opacity: 0,
              y: 52,
              scale: 0.96,
              filter: "blur(10px)",
            },
            enterTo: {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: "blur(0px)",
              duration: 0.95,
              ease: "power4.out",
            },
            position: 0,
          },
        ];

        if (!blownRef.current && canvasWrapRef.current) {
          items.push({
            el: canvasWrapRef.current,
            enterFrom: {
              opacity: 0,
              y: 64,
              scale: 0.86,
              rotateX: 8,
              filter: "blur(8px)",
            },
            enterTo: {
              opacity: 1,
              y: 0,
              scale: 1,
              rotateX: 0,
              filter: "blur(0px)",
              duration: 1.05,
              ease: "back.out(1.2)",
            },
            position: 0.16,
          });
        }

        if (!blownRef.current && inputPanelRef.current) {
          items.push({
            el: inputPanelRef.current,
            enterFrom: { opacity: 0, y: 36, scale: 0.94 },
            enterTo: {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.82,
              ease: "power3.out",
            },
            position: 0.3,
          });
        }

        return items;
      },
      { threshold: 0.22 }
    );
  }, []);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    evaluateInput(inputValue);
  };

  const handleInputChange = (value: string) => {
    if (inputLocked) return;
    setInputValue(value);
    if (hasError) {
      setHasError(false);
      setFeedback("");
    }
    if (isValidBlowInput(value)) {
      triggerBlow();
    }
  };

  return (
    <section
      id="birthday-cake"
      ref={sectionRef}
      className="birthday-cake-section"
      aria-labelledby="birthday-cake-heading"
    >
      <div className="birthday-cake-container" style={{marginTop:"1rem"}}>
        <div ref={headerRef} className="cake-header">
          <h2 id="birthday-cake-heading" className="cake-title">
            A Queen's <span>Wish</span>
          </h2>
          <p className="cake-subtitle">
            {showVideo
              ? "Happy Birthday, Queen Shakila! ✦"
              : "Your royal cake awaits — make a wish and blow out the candles 👑"}
          </p>
        </div>
      </div>

      <div className="cake-stage">
        <div className={`cake-media-wrap ${showVideo ? "cake-media-wrap--video" : ""}`}>
          <div ref={canvasWrapRef} className="cake-canvas-wrap">
            <BirthdayCakeScene
              blown={blown}
              onSequenceComplete={handleSequenceComplete}
            />
          </div>
        </div>
      </div>

      {showVideo &&
        createPortal(
          <div
            ref={videoOverlayRef}
            className="cake-video-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Birthday celebration video"
          >
            <div className="cake-video-wrap">
              {autoplayBlocked && (
                <button
                  type="button"
                  className="cake-video-play"
                  onClick={() => {
                    videoRef.current?.play();
                    setAutoplayBlocked(false);
                  }}
                >
                  Tap to play
                </button>
              )}
              <video
                ref={videoRef}
                className="cake-video"
                src={BIRTHDAY_VIDEO_SRC}
                controls
                autoPlay
                playsInline
                onClick={() => videoRef.current?.play()}
              />
            </div>
          </div>,
          document.body
        )}

      <div className="birthday-cake-container">
        {!blown && (
          <div ref={inputPanelRef} className="cake-blow-panel">
            <form className="cake-blow-form" onSubmit={handleSubmit}>
              <label htmlFor="cake-blow-input" className="cake-blow-label">
                Type{" "}
                <strong className="cake-blow-word">{BIRTHDAY_BLOW_WORD}</strong>{" "}
                to blow out the candles
              </label>
              <input
                id="cake-blow-input"
                ref={inputRef}
                type="text"
                className={`cake-blow-input ${hasError ? "cake-blow-input--error" : ""}`}
                value={inputValue}
                onChange={(event) => handleInputChange(event.target.value)}
                placeholder="Type فوت to blow out the candles..."
                autoComplete="off"
                disabled={inputLocked}
                dir="auto"
                aria-describedby={feedback ? "cake-blow-feedback" : undefined}
              />
              {feedback && (
                <p id="cake-blow-feedback" className="cake-blow-feedback" role="alert">
                  {feedback}
                </p>
              )}
              <button
                type="submit"
                className="cake-blow-submit"
                disabled={inputLocked}
              >
                Make a wish ✦
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default BirthdayCake;
