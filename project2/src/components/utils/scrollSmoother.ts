import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

export let smoother: ScrollSmoother;

export const initScrollSmoother = () => {
  if (smoother) return smoother;

  smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.7,
    speed: 1.7,
    effects: true,
    autoResize: true,
    ignoreMobileResize: true,
  });

  smoother.scrollTop(0);
  smoother.paused(true);

  window.addEventListener("resize", () => {
    ScrollSmoother.refresh(true);
  });

  return smoother;
};

export const isMonitorEmbed = () =>
  typeof window !== "undefined" && window.self !== window.top;
