import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  Sparkles,
} from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import { BLOW_SEQUENCE_DURATION } from "../config/birthdayCake";
import {
  ROYAL_PALETTE,
  royalCakeTextures,
} from "./birthdayCake/royalCakeAssets";

const CANDLE_POSITIONS: [number, number, number][] = [
  [-0.18, 1.52, 0.12],
  [0.18, 1.52, 0.12],
  [-0.13, 1.5, -0.15],
  [0.13, 1.5, -0.15],
  [0, 1.54, 0.02],
];

const CAKE_FOCUS: [number, number, number] = [0, 0.54, 0];
const INITIAL_CAMERA = { x: 0, y: 0.48, z: 6.2, fov: 46 };
const CAKE_MODEL_SCALE = 0.92;

const GEM_COLORS = [
  ROYAL_PALETTE.ruby,
  ROYAL_PALETTE.sapphire,
  ROYAL_PALETTE.emerald,
  ROYAL_PALETTE.amethyst,
  ROYAL_PALETTE.ruby,
];

function FrostingRuffle({
  radius,
  y,
  color,
  count = 28,
}: {
  radius: number;
  y: number;
  color: string;
  count?: number;
}) {
  const beads = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.9 + (i % 3) * 0.08,
      };
    });
  }, [count, radius]);

  return (
    <group position={[0, y, 0]}>
      {beads.map((bead, i) => (
        <mesh key={i} position={[bead.x, 0, bead.z]} scale={bead.scale}>
          <sphereGeometry args={[0.028, 12, 12]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.22}
            metalness={0.04}
            clearcoat={0.85}
            clearcoatRoughness={0.12}
          />
        </mesh>
      ))}
    </group>
  );
}

function PearlRing({
  radius,
  y,
  count = 36,
}: {
  radius: number;
  y: number;
  count?: number;
}) {
  const pearls = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2;
      return [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [
        number,
        number,
        number,
      ];
    });
  }, [count, radius]);

  return (
    <group position={[0, y, 0]}>
      {pearls.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.016, 10, 10]} />
          <meshPhysicalMaterial
            color="#fff8f0"
            roughness={0.08}
            metalness={0.15}
            clearcoat={1}
            clearcoatRoughness={0.05}
            iridescence={0.35}
            iridescenceIOR={1.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function GoldTrim({ radius, y }: { radius: number; y: number }) {
  return (
    <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, 0.012, 10, 72]} />
      <meshPhysicalMaterial
        map={royalCakeTextures.gold}
        color={ROYAL_PALETTE.goldLight}
        roughness={0.18}
        metalness={0.92}
        clearcoat={1}
        clearcoatRoughness={0.06}
      />
    </mesh>
  );
}

function RoyalTier({
  radius,
  height,
  y,
  texture,
  tint,
  sheen = 0.72,
}: {
  radius: number;
  height: number;
  y: number;
  texture: THREE.CanvasTexture;
  tint: string;
  sheen?: number;
}) {
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.015, height, 72]} />
        <meshPhysicalMaterial
          map={texture}
          color={tint}
          roughness={0.26}
          metalness={0.06}
          clearcoat={sheen}
          clearcoatRoughness={0.1}
          sheen={0.4}
          sheenRoughness={0.35}
          sheenColor={new THREE.Color("#ffffff")}
        />
      </mesh>
      <mesh position={[0, height / 2 + 0.018, 0]} castShadow>
        <cylinderGeometry args={[radius * 1.03, radius * 1.04, 0.038, 72]} />
        <meshPhysicalMaterial
          color="#fff5f8"
          roughness={0.14}
          metalness={0.02}
          clearcoat={0.95}
          clearcoatRoughness={0.06}
        />
      </mesh>
    </group>
  );
}

function DripIcing({
  radius,
  y,
  count = 10,
}: {
  radius: number;
  y: number;
  count?: number;
}) {
  const drips = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 + 0.2;
      const length = 0.07 + (i % 3) * 0.025;
      return {
        x: Math.cos(angle) * radius * 0.97,
        z: Math.sin(angle) * radius * 0.97,
        length,
        width: 0.022 + (i % 2) * 0.006,
      };
    });
  }, [count, radius]);

  return (
    <group position={[0, y, 0]}>
      {drips.map((drip, i) => (
        <mesh
          key={i}
          position={[drip.x, -drip.length / 2, drip.z]}
          scale={[drip.width / 0.024, drip.length / 0.09, drip.width / 0.024]}
        >
          <sphereGeometry args={[0.024, 12, 12]} />
          <meshPhysicalMaterial
            color={ROYAL_PALETTE.champagne}
            roughness={0.16}
            metalness={0.04}
            clearcoat={0.9}
            clearcoatRoughness={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

function RoseDecor({
  position,
  scale = 1,
  color = ROYAL_PALETTE.deepRose,
}: {
  position: [number, number, number];
  scale?: number;
  color?: string;
}) {
  const petals = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * Math.PI * 2,
      tilt: 0.35 + (i % 3) * 0.12,
      radius: 0.038 + (i % 2) * 0.01,
    }));
  }, []);

  return (
    <group position={position} scale={scale}>
      {petals.map((petal, i) => (
        <mesh
          key={i}
          rotation={[petal.tilt, petal.angle, 0]}
          position={[
            Math.cos(petal.angle) * 0.018,
            0.012 + (i % 2) * 0.008,
            Math.sin(petal.angle) * 0.018,
          ]}
        >
          <sphereGeometry args={[petal.radius, 10, 10]} />
          <meshPhysicalMaterial
            color={color}
            roughness={0.32}
            metalness={0.05}
            clearcoat={0.55}
            clearcoatRoughness={0.18}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.028, 0]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshStandardMaterial
          color={ROYAL_PALETTE.deepRose}
          roughness={0.4}
          emissive={ROYAL_PALETTE.rose}
          emissiveIntensity={0.08}
        />
      </mesh>
    </group>
  );
}

function CrownTopper({ position }: { position: [number, number, number] }) {
  const points = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        return {
          angle,
          x: Math.cos(angle) * 0.13,
          z: Math.sin(angle) * 0.13,
          height: i % 2 === 0 ? 0.18 : 0.13,
        };
      }),
    []
  );

  return (
    <group position={position} scale={1.35}>
      <mesh castShadow>
        <torusGeometry args={[0.11, 0.026, 12, 48]} />
        <meshPhysicalMaterial
          map={royalCakeTextures.gold}
          color={ROYAL_PALETTE.goldLight}
          roughness={0.14}
          metalness={0.95}
          clearcoat={1}
          clearcoatRoughness={0.04}
        />
      </mesh>

      {points.map((point, i) => (
        <group key={i} position={[point.x, 0.02, point.z]}>
          <mesh
            rotation={[0, point.angle + Math.PI / 2, 0]}
            position={[0, point.height / 2, 0]}
            castShadow
          >
            <coneGeometry args={[0.028, point.height, 4]} />
            <meshPhysicalMaterial
              color={ROYAL_PALETTE.gold}
              roughness={0.16}
              metalness={0.92}
              clearcoat={1}
              clearcoatRoughness={0.05}
            />
          </mesh>
          <mesh position={[0, point.height + 0.012, 0]}>
            <sphereGeometry args={[0.014, 10, 10]} />
            <meshPhysicalMaterial
              color={GEM_COLORS[i]}
              roughness={0.05}
              metalness={0.2}
              clearcoat={1}
              emissive={GEM_COLORS[i]}
              emissiveIntensity={0.35}
            />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.018, 0]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshPhysicalMaterial
          color={ROYAL_PALETTE.amethyst}
          roughness={0.06}
          metalness={0.15}
          clearcoat={1}
          emissive={ROYAL_PALETTE.amethyst}
          emissiveIntensity={0.45}
        />
      </mesh>
    </group>
  );
}

function CakeStand() {
  return (
    <group>
      <mesh receiveShadow position={[0, 0.018, 0]}>
        <cylinderGeometry args={[1.42, 1.48, 0.036, 72]} />
        <meshPhysicalMaterial
          color={ROYAL_PALETTE.plate}
          roughness={0.22}
          metalness={0.78}
          clearcoat={0.95}
        />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.14, 0.2, 0.12, 32]} />
        <meshPhysicalMaterial
          color={ROYAL_PALETTE.goldDark}
          roughness={0.2}
          metalness={0.88}
          clearcoat={0.9}
        />
      </mesh>
      <mesh castShadow position={[0, 0.16, 0]}>
        <cylinderGeometry args={[1.05, 1.08, 0.028, 72]} />
        <meshPhysicalMaterial
          map={royalCakeTextures.gold}
          color={ROYAL_PALETTE.goldLight}
          roughness={0.16}
          metalness={0.94}
          clearcoat={1}
        />
      </mesh>
    </group>
  );
}

function CandleFlame({
  index,
  position,
  blown,
  masterTimeline,
}: {
  index: number;
  position: [number, number, number];
  blown: boolean;
  masterTimeline: gsap.core.Timeline | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const wickRef = useRef<THREE.Mesh>(null);
  const smokeGroupRef = useRef<THREE.Group>(null);
  const flickerActive = useRef(true);
  const outerMat = useRef<THREE.MeshStandardMaterial | null>(null);
  const innerMat = useRef<THREE.MeshStandardMaterial | null>(null);

  useFrame((state) => {
    if (!flickerActive.current || !groupRef.current) return;

    const t = state.clock.elapsedTime + index * 1.7;
    const flickerY = 1 + Math.sin(t * 9) * 0.08 + Math.sin(t * 14) * 0.04;
    const flickerX = 1 + Math.sin(t * 11) * 0.05;

    groupRef.current.scale.set(flickerX, flickerY, flickerX);
    groupRef.current.position.x = Math.sin(t * 7) * 0.004;
    groupRef.current.rotation.z = Math.sin(t * 6) * 0.08;

    if (lightRef.current) {
      lightRef.current.intensity = 1.1 + Math.sin(t * 12) * 0.2;
    }
  });

  useEffect(() => {
    if (outerRef.current?.material instanceof THREE.MeshStandardMaterial) {
      outerMat.current = outerRef.current.material;
    }
    if (innerRef.current?.material instanceof THREE.MeshStandardMaterial) {
      innerMat.current = innerRef.current.material;
    }
  }, []);

  useEffect(() => {
    if (!blown || !masterTimeline || !groupRef.current) return;

    flickerActive.current = false;
    const group = groupRef.current;
    const light = lightRef.current;
    const smokeGroup = smokeGroupRef.current;
    const stagger = index * 0.06;
    const windX = (index - 2) * 0.025 + (Math.random() - 0.5) * 0.04;

    masterTimeline.to(
      group.scale,
      {
        x: 1.35,
        y: 0.55,
        z: 1.2,
        duration: 0.18,
        ease: "sine.inOut",
      },
      stagger
    );
    masterTimeline.to(
      group.scale,
      {
        x: 0.65,
        y: 0.35,
        z: 0.6,
        duration: 0.17,
        ease: "power1.in",
      },
      stagger + 0.18
    );
    masterTimeline.to(
      group.position,
      {
        x: windX,
        z: position[2] + 0.06,
        duration: 0.35,
        ease: "sine.in",
      },
      stagger
    );

    if (outerMat.current) {
      masterTimeline.to(
        outerMat.current,
        { emissiveIntensity: 0.4, opacity: 0.5, duration: 0.25, ease: "power1.in" },
        stagger + 0.2
      );
    }
    if (innerMat.current) {
      masterTimeline.to(
        innerMat.current,
        { emissiveIntensity: 0.2, duration: 0.25, ease: "power1.in" },
        stagger + 0.2
      );
    }

    masterTimeline.to(
      group.scale,
      { x: 0, y: 0, z: 0, duration: 0.28, ease: "power3.in" },
      stagger + 0.3
    );

    if (light) {
      masterTimeline.to(
        light,
        { intensity: 0, duration: 0.35, ease: "power2.inOut" },
        stagger + 0.2
      );
    }

    if (wickRef.current?.material instanceof THREE.MeshStandardMaterial) {
      const wickMaterial = wickRef.current.material;
      masterTimeline.to(
        wickMaterial,
        { emissiveIntensity: 0.7, duration: 0.3, ease: "power1.out" },
        stagger + 0.35
      );
    }

    if (smokeGroup) {
      masterTimeline.call(
        () => {
          for (let i = 0; i < 4; i++) {
            const mesh = new THREE.Mesh(
              new THREE.SphereGeometry(0.02 + Math.random() * 0.015, 8, 8),
              new THREE.MeshBasicMaterial({
                color: ROYAL_PALETTE.smoke,
                transparent: true,
                opacity: 0.45,
              })
            );
            mesh.position.set(
              position[0] + (Math.random() - 0.5) * 0.03,
              position[1] + 0.2,
              position[2] + (Math.random() - 0.5) * 0.03
            );
            smokeGroup.add(mesh);

            gsap.to(mesh.position, {
              y: mesh.position.y + 0.35 + Math.random() * 0.15,
              x: mesh.position.x + (Math.random() - 0.5) * 0.06,
              z: mesh.position.z + (Math.random() - 0.5) * 0.06,
              duration: 0.9,
              ease: "sine.out",
            });
            gsap.to(mesh.scale, {
              x: 2.2,
              y: 2.2,
              z: 2.2,
              duration: 0.85,
              ease: "sine.out",
            });
            gsap.to(mesh.material, {
              opacity: 0,
              duration: 0.75,
              delay: 0.2,
              ease: "power1.out",
            });
          }
        },
        undefined,
        stagger + 0.4
      );
    }
  }, [blown, index, masterTimeline, position]);

  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.024, 0.024, 0.13, 16]} />
        <meshPhysicalMaterial
          color={ROYAL_PALETTE.ivory}
          roughness={0.28}
          metalness={0.08}
          clearcoat={0.7}
        />
      </mesh>
      <mesh position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.028, 0.024, 0.018, 16]} />
        <meshPhysicalMaterial
          map={royalCakeTextures.gold}
          color={ROYAL_PALETTE.goldLight}
          roughness={0.18}
          metalness={0.9}
        />
      </mesh>
      <mesh ref={wickRef} position={[0, 0.138, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.018, 8]} />
        <meshStandardMaterial
          color={ROYAL_PALETTE.wick}
          emissive="#fb923c"
          emissiveIntensity={0.15}
        />
      </mesh>
      <group ref={groupRef} position={[0, 0.19, 0]}>
        <mesh ref={outerRef} position={[0, 0.05, 0]}>
          <coneGeometry args={[0.048, 0.11, 16]} />
          <meshStandardMaterial
            color={ROYAL_PALETTE.flameOuter}
            emissive="#f97316"
            emissiveIntensity={2.4}
            transparent
            opacity={0.92}
            toneMapped={false}
          />
        </mesh>
        <mesh ref={innerRef} position={[0, 0.045, 0]}>
          <coneGeometry args={[0.026, 0.065, 12]} />
          <meshStandardMaterial
            color={ROYAL_PALETTE.flameInner}
            emissive="#fde68a"
            emissiveIntensity={3.2}
            toneMapped={false}
          />
        </mesh>
        <pointLight
          ref={lightRef}
          color="#ffd89b"
          intensity={1.1}
          distance={1.5}
          decay={2}
        />
      </group>
      <group ref={smokeGroupRef} />
    </group>
  );
}

function CameraLookAt({ target }: { target: [number, number, number] }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(...target);
  }, [camera, target]);

  return null;
}

function CameraRig({
  blown,
  masterTimeline,
}: {
  blown: boolean;
  masterTimeline: gsap.core.Timeline | null;
}) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(...CAKE_FOCUS));

  useEffect(() => {
    if (!blown || !masterTimeline || !(camera instanceof THREE.PerspectiveCamera)) return;

    masterTimeline.to(
      camera.position,
      {
        x: 0,
        y: 0.72,
        z: 5.1,
        duration: BLOW_SEQUENCE_DURATION,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(lookTarget.current),
      },
      0
    );
    masterTimeline.to(
      lookTarget.current,
      {
        y: 0.82,
        duration: BLOW_SEQUENCE_DURATION,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(lookTarget.current),
      },
      0
    );
    masterTimeline.to(
      camera,
      {
        fov: 40,
        duration: BLOW_SEQUENCE_DURATION,
        ease: "power2.inOut",
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      0
    );
  }, [blown, camera, masterTimeline]);

  return null;
}

function SceneLighting({
  blown,
  masterTimeline,
}: {
  blown: boolean;
  masterTimeline: gsap.core.Timeline | null;
}) {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);
  const accentRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    if (!blown || !masterTimeline) return;

    if (ambientRef.current) {
      masterTimeline.to(
        ambientRef.current,
        { intensity: 0.22, duration: BLOW_SEQUENCE_DURATION, ease: "power1.inOut" },
        0
      );
    }
    if (keyRef.current) {
      masterTimeline.to(
        keyRef.current,
        { intensity: 0.95, duration: BLOW_SEQUENCE_DURATION, ease: "power1.inOut" },
        0
      );
    }
    if (fillRef.current) {
      masterTimeline.to(
        fillRef.current,
        { intensity: 0.32, duration: BLOW_SEQUENCE_DURATION, ease: "power1.inOut" },
        0
      );
    }
    if (rimRef.current) {
      masterTimeline.to(
        rimRef.current,
        { intensity: 0.45, duration: BLOW_SEQUENCE_DURATION, ease: "power1.inOut" },
        0
      );
    }
    if (accentRef.current) {
      masterTimeline.to(
        accentRef.current,
        { intensity: 0.12, duration: BLOW_SEQUENCE_DURATION, ease: "power1.inOut" },
        0
      );
    }
  }, [blown, masterTimeline]);

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.42} color="#fff5eb" />
      <directionalLight
        ref={keyRef}
        position={[3.5, 5.5, 4]}
        intensity={1.45}
        color="#fff8ee"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight
        ref={fillRef}
        position={[-3.2, 2.5, 2.5]}
        intensity={0.62}
        color="#f5c6d0"
      />
      <directionalLight
        ref={rimRef}
        position={[0, 4.5, 1.5]}
        intensity={0.72}
        color={ROYAL_PALETTE.goldLight}
      />
      <pointLight
        position={[0, 2.8, 0.8]}
        intensity={0.65}
        color="#fff8ee"
        distance={4}
      />
      <pointLight
        ref={accentRef}
        position={[0, 2.4, 1.8]}
        intensity={0.55}
        color={ROYAL_PALETTE.gold}
        distance={5}
      />
    </>
  );
}

function CakeModel({
  blown,
  masterTimeline,
}: {
  blown: boolean;
  masterTimeline: gsap.core.Timeline | null;
}) {
  const rootRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!rootRef.current || blown) return;
    rootRef.current.rotation.y += delta * 0.12;
  });

  const roses = useMemo(
    () =>
      [
        { pos: [0.95, 0.52, 0.35] as [number, number, number], scale: 1.15 },
        { pos: [-0.88, 0.52, -0.28] as [number, number, number], scale: 1.05 },
        { pos: [0.62, 0.98, -0.72] as [number, number, number], scale: 0.95 },
        { pos: [-0.58, 0.98, 0.68] as [number, number, number], scale: 1 },
        { pos: [0.42, 1.22, 0.48] as [number, number, number], scale: 0.82 },
        { pos: [-0.38, 1.22, -0.42] as [number, number, number], scale: 0.78 },
      ] as const,
    []
  );

  return (
    <group ref={rootRef} position={[0, -0.38, 0]} scale={CAKE_MODEL_SCALE}>
      <CakeStand />

      <RoyalTier
        radius={1.08}
        height={0.5}
        y={0.42}
        texture={royalCakeTextures.blush}
        tint={ROYAL_PALETTE.blush}
      />
      <GoldTrim radius={1.06} y={0.69} />
      <PearlRing radius={1.04} y={0.67} />
      <FrostingRuffle radius={1.02} y={0.66} color="#fff8fa" />

      <RoyalTier
        radius={0.76}
        height={0.38}
        y={0.86}
        texture={royalCakeTextures.rose}
        tint={ROYAL_PALETTE.rose}
      />
      <GoldTrim radius={0.74} y={1.07} />
      <PearlRing radius={0.72} y={1.05} count={28} />
      <FrostingRuffle radius={0.7} y={1.04} color="#fff5f8" count={22} />

      <RoyalTier
        radius={0.48}
        height={0.3}
        y={1.2}
        texture={royalCakeTextures.ivory}
        tint={ROYAL_PALETTE.ivory}
        sheen={0.88}
      />
      <GoldTrim radius={0.46} y={1.37} />
      <DripIcing radius={0.44} y={1.35} />
      <PearlRing radius={0.44} y={1.34} count={22} />

      <CrownTopper position={[0, 1.42, 0]} />

      {roses.map((rose, i) => (
        <RoseDecor
          key={i}
          position={rose.pos}
          scale={rose.scale}
          color={i % 2 === 0 ? ROYAL_PALETTE.deepRose : ROYAL_PALETTE.rose}
        />
      ))}

      {CANDLE_POSITIONS.map((pos, index) => (
        <CandleFlame
          key={index}
          index={index}
          position={pos}
          blown={blown}
          masterTimeline={masterTimeline}
        />
      ))}

      <Sparkles
        count={22}
        scale={[2.8, 2.2, 2.8]}
        size={2.2}
        speed={0.18}
        opacity={0.55}
        color={ROYAL_PALETTE.goldLight}
      />
      <Sparkles
        count={14}
        scale={[2.4, 1.8, 2.4]}
        size={1.6}
        speed={0.14}
        opacity={0.35}
        color={ROYAL_PALETTE.rose}
      />
    </group>
  );
}

function CakeSceneContent({
  blown,
  onSequenceComplete,
}: {
  blown: boolean;
  onSequenceComplete: () => void;
}) {
  const [masterTimeline, setMasterTimeline] =
    useState<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!blown) return;

    const tl = gsap.timeline({
      paused: true,
      onComplete: onSequenceComplete,
    });
    setMasterTimeline(tl);

    return () => {
      tl.kill();
      setMasterTimeline(null);
    };
  }, [blown, onSequenceComplete]);

  useEffect(() => {
    if (!masterTimeline) return;
    masterTimeline.play(0);
  }, [masterTimeline]);

  return (
    <>
      <SceneLighting blown={blown} masterTimeline={masterTimeline} />
      <CameraLookAt target={CAKE_FOCUS} />
      <CameraRig blown={blown} masterTimeline={masterTimeline} />

      <Float speed={0.55} rotationIntensity={0.018} floatIntensity={0.035}>
        <CakeModel blown={blown} masterTimeline={masterTimeline} />
      </Float>

      <ContactShadows
        position={[0, -0.38, 0]}
        opacity={0.45}
        scale={5.2}
        blur={2.8}
        far={3.5}
        color="#1a0a0f"
      />
      <Environment preset="apartment" />

      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.48}
          luminanceSmoothing={0.82}
          intensity={blown ? 0.42 : 1.05}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

type BirthdayCakeSceneProps = {
  blown: boolean;
  onSequenceComplete: () => void;
};

export default function BirthdayCakeScene({
  blown,
  onSequenceComplete,
}: BirthdayCakeSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      camera={{
        position: [INITIAL_CAMERA.x, INITIAL_CAMERA.y, INITIAL_CAMERA.z],
        fov: INITIAL_CAMERA.fov,
      }}
      gl={{ antialias: true, alpha: true }}
    >
      <CakeSceneContent
        blown={blown}
        onSequenceComplete={onSequenceComplete}
      />
    </Canvas>
  );
}
