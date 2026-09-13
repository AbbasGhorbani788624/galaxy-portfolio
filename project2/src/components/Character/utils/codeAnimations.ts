import gsap from "gsap";
import * as THREE from "three";
import { ProceduralParts } from "./proceduralCharacter";

export interface CharacterAnimationHandles {
  stopAll: () => void;
  playIntro: () => gsap.core.Timeline;
  startIdle: () => void;
  startTyping: () => void;
}

export const createCodeAnimations = (
  root: THREE.Group,
  _lookPivot: THREE.Object3D,
  _upperBodyPivot: THREE.Object3D,
  parts: ProceduralParts
): CharacterAnimationHandles => {
  const active: Array<gsap.core.Tween | gsap.core.Timeline> = [];

  const track = <T extends gsap.core.Tween | gsap.core.Timeline>(animation: T) => {
    active.push(animation);
    return animation;
  };

  const stopAll = () => {
    active.forEach((animation) => animation.kill());
    active.length = 0;
  };

  const playIntro = () => {
    parts.laptop.scale.setScalar(0.001);
    parts.headphones.scale.setScalar(0.001);
    root.position.y = -0.5;
    root.rotation.y = 0.15;

    const timeline = track(
      gsap.timeline({
        onComplete: () => {
          startIdle();
          startTyping();
        },
      })
    );

    timeline.to(root.position, { y: 0, duration: 1, ease: "power2.out" }, 0);
    timeline.to(root.rotation, { y: 0, duration: 1, ease: "power2.out" }, 0);
    timeline.to(
      parts.laptop.scale,
      { x: 1, y: 1, z: 1, duration: 0.9, ease: "back.out(1.5)" },
      0.2
    );
    timeline.to(
      parts.headphones.scale,
      { x: 1, y: 1, z: 1, duration: 0.85, ease: "back.out(1.4)" },
      0.35
    );

    return timeline;
  };

  const startIdle = () => {
    track(
      gsap.to(root.position, {
        y: "+=0.006",
        repeat: -1,
        yoyo: true,
        duration: 3,
        ease: "sine.inOut",
      })
    );
  };

  const startTyping = () => {
    track(
      gsap.to(parts.laptopDisplay.material, {
        emissiveIntensity: 1.6,
        repeat: -1,
        yoyo: true,
        duration: 0.08,
        ease: "steps(1)",
      })
    );
  };

  return {
    stopAll,
    playIntro,
    startIdle,
    startTyping,
  };
};

export const setupHoverBrows = (
  _headPivot: THREE.Object3D,
  hoverDiv: HTMLElement,
  parts: ProceduralParts
) => {
  const onEnter = () => {
    gsap.to(parts.laptopDisplay.material, { emissiveIntensity: 2, duration: 0.35 });
    gsap.to(parts.headphones.rotation, { y: -0.32, duration: 0.35 });
  };

  const onLeave = () => {
    gsap.to(parts.laptopDisplay.material, { emissiveIntensity: 1.4, duration: 0.4 });
    gsap.to(parts.headphones.rotation, { y: -0.42, duration: 0.4 });
  };

  hoverDiv.addEventListener("mouseenter", onEnter);
  hoverDiv.addEventListener("mouseleave", onLeave);

  return () => {
    hoverDiv.removeEventListener("mouseenter", onEnter);
    hoverDiv.removeEventListener("mouseleave", onLeave);
  };
};
