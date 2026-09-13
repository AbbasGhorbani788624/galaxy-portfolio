import { useEffect, useMemo, useRef, useState } from "react";
import { assetUrl } from "../utils/assetUrl";
import "./styles/MoonHub.css";

type Feature = {
  title: string;
  description: string;
  corner: "tl" | "tr" | "bl" | "br";
};

const CORNERS: Feature["corner"][] = ["tl", "tr", "bl", "br"];

const CORNER_ANCHOR: Record<Feature["corner"], { x: number; y: number }> = {
  tl: { x: 36, y: 40 },
  tr: { x: 64, y: 40 },
  bl: { x: 38, y: 58 },
  br: { x: 62, y: 58 },
};

const CORNER_CARD: Record<Feature["corner"], { x: number; y: number }> = {
  tl: { x: 3, y: 5 },
  tr: { x: 97, y: 5 },
  bl: { x: 3, y: 95 },
  br: { x: 97, y: 95 },
};

const CYCLE_MS = 9000;

const FEATURE_SETS: Omit<Feature, "corner">[][] = [
  [
    {
      title: "Honors Her Family",
      description: "Deep respect for the people she loves.",
    },
    {
      title: "Talented",
      description: "Gifted in everything she pursues.",
    },
    {
      title: "Charming",
      description: "Her presence lights up every room.",
    },
    {
      title: "Beautiful",
      description: "Graceful, radiant, inside and out.",
    },
  ],
  [
    {
      title: "Stunning",
      description: "Simply breathtaking, every single day.",
    },
    {
      title: "Intelligent",
      description: "Sharp, thoughtful, and wise.",
    },
    {
      title: "One of a Kind",
      description: "There is no one else like her.",
    },
    {
      title: "Kind-hearted",
      description: "Warmth and care flow from her heart.",
    },
  ],
  [
    {
      title: "Trustworthy",
      description: "Someone you can always count on.",
    },
    {
      title: "Full of Character",
      description: "Strong, grounded, and true to herself.",
    },
    {
      title: "Honest",
      description: "Real, sincere, and genuine.",
    },
    {
      title: "Polite",
      description: "Graceful and respectful with everyone.",
    },
  ],
];

function connectorPath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  corner: Feature["corner"]
) {
  if (corner === "tl" || corner === "bl") {
    const bendX = from.x - 20;
    return `M ${from.x} ${from.y} L ${bendX} ${from.y} L ${bendX} ${to.y} L ${to.x} ${to.y}`;
  }

  const bendX = from.x + 20;
  return `M ${from.x} ${from.y} L ${bendX} ${from.y} L ${bendX} ${to.y} L ${to.x} ${to.y}`;
}

function HubOverlay({ features }: { features: Feature[] }) {
  return (
    <div className="moon-hub-cycle" aria-live="polite">
      <svg
        className="moon-hub__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {features.map((feature, index) => {
          const from = CORNER_ANCHOR[feature.corner];
          const to = CORNER_CARD[feature.corner];

          return (
            <path
              key={feature.corner}
              className="moon-hub__line"
              style={{ "--line-i": index } as React.CSSProperties}
              d={connectorPath(from, to, feature.corner)}
            />
          );
        })}

        {Object.values(CORNER_ANCHOR).map((point, index) => (
          <circle
            key={index}
            className="moon-hub__anchor"
            style={{ "--anchor-i": index } as React.CSSProperties}
            cx={point.x}
            cy={point.y}
            r="0.7"
          />
        ))}
      </svg>

      {features.map((feature, index) => {
        const pos = CORNER_CARD[feature.corner];

        return (
          <article
            key={feature.corner}
            className={`moon-hub__card moon-hub__card--${feature.corner}`}
            style={
              {
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                "--card-i": index,
              } as React.CSSProperties
            }
          >
            <h3 className="moon-hub__card-title">{feature.title}</h3>
            <p className="moon-hub__card-desc">{feature.description}</p>
          </article>
        );
      })}
    </div>
  );
}

const MoonHub = () => {
  const featureSets = useMemo(
    () =>
      FEATURE_SETS.map((set) =>
        set.map((item, index) => ({
          ...item,
          corner: CORNERS[index],
        }))
      ),
    []
  );

  const sectionRef = useRef<HTMLElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const [setIndex, setSetIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
    );

    const hubObserver = new IntersectionObserver(
      ([entry]) => setIsActive(entry.isIntersecting),
      { threshold: 0.2 }
    );

    const header = section.querySelector(".moon-hub-header");
    const hub = section.querySelector(".moon-hub__frame");

    if (header) headerObserver.observe(header);
    if (hub) hubObserver.observe(hub);

    return () => {
      headerObserver.disconnect();
      hubObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!isActive || featureSets.length <= 1) return;

    const timer = window.setInterval(() => {
      setSetIndex((prev) => (prev + 1) % featureSets.length);
    }, CYCLE_MS);

    return () => window.clearInterval(timer);
  }, [isActive, featureSets.length]);

  return (
    <section
      id="moon-hub"
      ref={sectionRef}
      aria-labelledby="moon-hub-heading"
      className="moon-hub-section"
    >
      <div className="moon-hub-container">
        <div
          className={`moon-hub-header ${headerVisible ? "moon-hub-header--visible" : ""}`}
        >
          <h2 id="moon-hub-heading" className="moon-hub-title">
            Birthday <span>Moon</span>
          </h2>
          <p className="moon-hub-desc">What kind of girl is Shakila?</p>
        </div>

        <div className="moon-hub">
          <div className="moon-hub__stage">
            <div className="moon-hub__frame">
              <div className="moon-hub__image-wrap">
                <img
                  src={assetUrl("/images/Moon.png")}
                  alt="Moon — birthday tribute for Shakila"
                  className="moon-hub__image"
                />
              </div>
              <div className="moon-hub__overlay">
                {isActive && (
                  <HubOverlay key={setIndex} features={featureSets[setIndex]} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MoonHub;
