import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import gsap from "gsap";
import * as THREE from "three";
import { createHeartPath, createHeartFillTexture, createHeartShapeGeometry, getPointOnHeart, sampleHeartCurve } from "./mathHeart/heartCurve";

type MathHeartSceneProps = {
  active: boolean;
};

function OrthoFit() {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return;

    const aspect = size.width / size.height;
    const frustum = 1.05;
    camera.left = -frustum * aspect;
    camera.right = frustum * aspect;
    camera.top = frustum;
    camera.bottom = -frustum;
    camera.near = 0.1;
    camera.far = 20;
    camera.position.set(0, 0, 5);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera, size.height, size.width]);

  return null;
}

function Axes() {
  const xLine = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.35, 0, 0),
      new THREE.Vector3(1.35, 0, 0),
    ]);
    const material = new THREE.LineBasicMaterial({
      color: "#94a3b8",
      transparent: true,
      opacity: 0.42,
    });
    return new THREE.Line(geometry, material);
  }, []);

  const yLine = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -1.05, 0),
      new THREE.Vector3(0, 1.05, 0),
    ]);
    const material = new THREE.LineBasicMaterial({
      color: "#94a3b8",
      transparent: true,
      opacity: 0.42,
    });
    return new THREE.Line(geometry, material);
  }, []);

  return (
    <group>
      <primitive object={xLine} />
      <primitive object={yLine} />
    </group>
  );
}

function HeartDrawing({ active }: { active: boolean }) {
  const points = useMemo(() => sampleHeartCurve(720), []);
  const path = useMemo(() => createHeartPath(720), []);
  const dotRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const progressRef = useRef(0);
  const drawTweenRef = useRef<gsap.core.Tween | null>(null);
  const loopTweenRef = useRef<gsap.core.Tween | null>(null);
  const fillMaterialRef = useRef<THREE.MeshBasicMaterial | null>(null);

  const fillGeometry = useMemo(() => createHeartShapeGeometry(points), [points]);

  const fillMaterial = useMemo(() => {
    const mat = new THREE.MeshBasicMaterial({
      map: createHeartFillTexture(),
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    fillMaterialRef.current = mat;
    return mat;
  }, []);

  const heartLine = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    geo.setDrawRange(0, 0);
    const mat = new THREE.LineBasicMaterial({
      color: "#f8fafc",
      transparent: true,
      opacity: 0.92,
    });
    return new THREE.Line(geo, mat);
  }, [points]);

  useEffect(() => {
    drawTweenRef.current?.kill();
    loopTweenRef.current?.kill();
    progressRef.current = 0;
    heartLine.geometry.setDrawRange(0, 0);
    if (fillMaterialRef.current) fillMaterialRef.current.opacity = 0;

    if (!active) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      progressRef.current = 1;
      heartLine.geometry.setDrawRange(0, points.length);
      if (fillMaterialRef.current) fillMaterialRef.current.opacity = 0.96;
      return;
    }

    const drawProxy = { p: 0 };
    drawTweenRef.current = gsap.to(drawProxy, {
      p: 1,
      duration: 5.2,
      ease: "power1.inOut",
      onUpdate: () => {
        progressRef.current = drawProxy.p;
        const count = Math.max(2, Math.floor(drawProxy.p * points.length));
        heartLine.geometry.setDrawRange(0, count);

        if (fillMaterialRef.current) {
          const fillProgress = Math.max(0, (drawProxy.p - 0.68) / 0.32);
          fillMaterialRef.current.opacity = fillProgress * 0.96;
        }
      },
      onComplete: () => {
        if (fillMaterialRef.current) fillMaterialRef.current.opacity = 0.96;

        const loopProxy = { p: 0 };
        loopTweenRef.current = gsap.to(loopProxy, {
          p: 1,
          duration: 8,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            progressRef.current = loopProxy.p;
          },
        });
      },
    });

    return () => {
      drawTweenRef.current?.kill();
      loopTweenRef.current?.kill();
    };
  }, [active, heartLine, points.length]);

  useFrame(() => {
    const point = getPointOnHeart(path, progressRef.current);
    dotRef.current?.position.copy(point);
    glowRef.current?.position.copy(point);
  });

  return (
    <group>
      <mesh geometry={fillGeometry} material={fillMaterial} position={[0, 0, -0.01]} />
      <primitive object={heartLine} />
      <mesh ref={dotRef} position={[0.55, 0, 0]}>
        <sphereGeometry args={[0.028, 20, 20]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#ff2d55"
          emissiveIntensity={2.4}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={glowRef}
        color="#ff4d6d"
        intensity={1.4}
        distance={1.2}
        decay={2}
      />
    </group>
  );
}

function SceneContent({ active }: { active: boolean }) {
  return (
    <>
      <OrthoFit />
      <ambientLight intensity={0.35} />
      <Axes />
      <HeartDrawing active={active} />
      <EffectComposer multisampling={0}>
        <Bloom
          luminanceThreshold={0.18}
          luminanceSmoothing={0.82}
          intensity={1.05}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function MathHeartScene({ active }: MathHeartSceneProps) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true }}
      orthographic
      camera={{ position: [0, 0, 5], zoom: 1 }}
    >
      <SceneContent active={active} />
    </Canvas>
  );
}
