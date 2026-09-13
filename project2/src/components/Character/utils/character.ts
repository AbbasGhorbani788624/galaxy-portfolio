import * as THREE from "three";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import {
  buildProceduralCharacter,
  ProceduralCharacter,
} from "./proceduralCharacter";

export type LoadedCharacter = ProceduralCharacter;

const setCharacter = (
  _renderer: THREE.WebGLRenderer,
  _scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loadCharacter = () => {
    return new Promise<LoadedCharacter | null>((resolve) => {
      const character = buildProceduralCharacter();
      setCharTimeline(character.root, camera, character.lookPivot);
      setAllTimeline();
      resolve(character);
    });
  };

  return { loadCharacter };
};

export default setCharacter;
