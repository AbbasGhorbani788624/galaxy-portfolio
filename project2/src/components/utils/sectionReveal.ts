import gsap from "gsap";

export type ScrollRevealItem = {
  el: HTMLElement | null;
  enterFrom: gsap.TweenVars;
  enterTo: gsap.TweenVars;
  position?: gsap.Position;
};

type ScrollRevealOptions = {
  threshold?: number;
  rootMargin?: string;
  onEnter?: () => void;
  onLeave?: () => void;
  skipEnter?: () => boolean;
  skipLeave?: () => boolean;
};

export function bindScrollReveal(
  section: HTMLElement,
  getItems: () => ScrollRevealItem[],
  options: ScrollRevealOptions = {}
) {
  let enterTl: gsap.core.Timeline | null = null;

  const activeItems = () => getItems().filter((item) => item.el);

  const resetItems = () => {
    activeItems().forEach(({ el, enterFrom }) => {
      if (!el) return;
      gsap.set(el, enterFrom);
    });
  };

  const playEnter = () => {
    if (options.skipEnter?.()) return;

    enterTl?.kill();
    resetItems();
    options.onEnter?.();

    enterTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    activeItems().forEach(({ el, enterFrom, enterTo, position }) => {
      if (!el) return;
      enterTl!.fromTo(el, enterFrom, enterTo, position ?? 0);
    });
  };

  const playLeave = () => {
    if (options.skipLeave?.()) return;

    enterTl?.kill();
    options.onLeave?.();

    const elements = activeItems().map((item) => item.el);
    if (!elements.length) return;

    gsap.to(elements, {
      opacity: 0,
      y: -28,
      scale: 0.97,
      duration: 0.45,
      ease: "power2.in",
      stagger: 0.06,
    });
  };

  resetItems();

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        playEnter();
      } else {
        playLeave();
      }
    },
    {
      threshold: options.threshold ?? 0.22,
      rootMargin: options.rootMargin ?? "0px 0px -8% 0px",
    }
  );

  observer.observe(section);

  return () => {
    observer.disconnect();
    enterTl?.kill();
  };
}
