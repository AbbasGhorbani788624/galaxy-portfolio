import { useEffect, useRef } from "react";
import * as THREE from "three";
import setCharacter from "./utils/character";
import setLighting from "./utils/lighting";
import { useLoading } from "../../context/LoadingProvider";
import handleResize from "./utils/resizeUtils";
import {
  handleMouseMove,
  handleTouchEnd,
  handleTouchMove,
} from "./utils/mouseUtils";
import {
  createCodeAnimations,
  setupHoverBrows,
} from "./utils/codeAnimations";
import { setProgress } from "../Loading";
import { PALETTE } from "./utils/proceduralCharacter";

const Scene = () => {
  const canvasDiv = useRef<HTMLDivElement | null>(null);
  const hoverDivRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef(new THREE.Scene());
  const { setLoading } = useLoading();

  useEffect(() => {
    if (!canvasDiv.current) return;

    const rect = canvasDiv.current.getBoundingClientRect();
    const container = { width: rect.width, height: rect.height };
    const aspect = container.width / container.height;
    const scene = sceneRef.current;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setSize(container.width, container.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    canvasDiv.current.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(28, aspect, 0.1, 1000);
    camera.position.set(0, 0.9, 4.6);
    camera.lookAt(0.15, 0.78, 0);
    camera.updateProjectionMatrix();

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(2, 3, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(PALETTE.cyan, 0.5);
    fillLight.position.set(-2, 1, 3);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(PALETTE.pythonYellow, 0.6, 12, 2);
    rimLight.position.set(0, 1.5, -1);
    scene.add(rimLight);

    let characterRoot: THREE.Group | null = null;
    let characterUpdate: ((elapsed: number, mouse: { x: number; y: number }) => void) | null = null;
    let characterDispose: (() => void) | null = null;
    let animationHandles: ReturnType<typeof createCodeAnimations> | null = null;
    let removeHover: (() => void) | null = null;

    const clock = new THREE.Clock();
    const light = setLighting(scene);
    const progress = setProgress((value) => setLoading(value));
    const { loadCharacter } = setCharacter(renderer, scene, camera);

    const onResize = () => {
      if (characterRoot) {
        handleResize(renderer, camera, canvasDiv, characterRoot);
      }
    };

    loadCharacter().then((character) => {
      if (!character) return;

      characterRoot = character.root;
      characterUpdate = character.update;
      characterDispose = character.dispose;
      scene.add(character.root);

      animationHandles = createCodeAnimations(
        character.root,
        character.lookPivot,
        character.upperBodyPivot,
        character.parts
      );

      if (hoverDivRef.current) {
        removeHover = setupHoverBrows(
          character.headPivot,
          hoverDivRef.current,
          character.parts
        );
      }

      document.body.classList.add("character-loaded");

      progress.loaded().then(() => {
        setTimeout(() => {
          light.turnOnLights();
          animationHandles?.playIntro();
        }, 2500);
      });

      window.addEventListener("resize", onResize);
    });

    let mouse = { x: 0, y: 0 };

    const onMouseMove = (event: MouseEvent) => {
      handleMouseMove(event, (x, y) => {
        mouse = { x, y };
      });
    };

    let debounce: number | undefined;
    const onTouchStart = (event: TouchEvent) => {
      const element = event.target as HTMLElement;
      debounce = window.setTimeout(() => {
        element?.addEventListener("touchmove", (e: TouchEvent) =>
          handleTouchMove(e, (x, y) => {
            mouse = { x, y };
          })
        );
      }, 200);
    };

    const onTouchEnd = () => {
      handleTouchEnd((x, y) => {
        mouse = { x, y };
      });
    };

    document.addEventListener("mousemove", onMouseMove);

    const landingDiv = document.getElementById("landingDiv");
    if (landingDiv) {
      landingDiv.addEventListener("touchstart", onTouchStart);
      landingDiv.addEventListener("touchend", onTouchEnd);
    }

    const animate = () => {
      requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      characterUpdate?.(elapsed, mouse);

      rimLight.intensity = 0.5 + Math.sin(elapsed * 1.6) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      clearTimeout(debounce);
      animationHandles?.stopAll();
      removeHover?.();
      characterDispose?.();
      document.body.classList.remove("character-loaded");
      scene.clear();
      renderer.dispose();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousemove", onMouseMove);

      if (canvasDiv.current?.contains(renderer.domElement)) {
        canvasDiv.current.removeChild(renderer.domElement);
      }

      if (landingDiv) {
        landingDiv.removeEventListener("touchstart", onTouchStart);
        landingDiv.removeEventListener("touchend", onTouchEnd);
      }
    };
  }, [setLoading]);

  return (
    <div className="character-container">
      <div className="character-model" ref={canvasDiv}>
        <div className="character-rim"></div>
        <div className="character-hover" ref={hoverDivRef}></div>
      </div>
    </div>
  );
};

export default Scene;
