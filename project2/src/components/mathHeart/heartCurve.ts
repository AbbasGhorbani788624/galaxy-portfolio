import * as THREE from "three";

/** Points for (x² + y² − 1)³ − x²y³ = 0 (classic heart implicit curve). */
export function sampleHeartCurve(segments = 720): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const x = Math.sin(t) ** 3;
    const y =
      (13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)) /
      16;
    points.push(new THREE.Vector3(x, y, 0));
  }

  return points;
}

export function createHeartPath(segments = 720): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3(sampleHeartCurve(segments), true, "catmullrom", 0.2);
}

export function getPointOnHeart(path: THREE.CatmullRomCurve3, progress: number): THREE.Vector3 {
  return path.getPointAt(Math.min(Math.max(progress, 0), 1));
}

export function createHeartShapeGeometry(
  points: THREE.Vector3[]
): THREE.ShapeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    shape.lineTo(points[i].x, points[i].y);
  }

  shape.closePath();
  return new THREE.ShapeGeometry(shape);
}

export function createHeartFillTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  const gradient = ctx.createRadialGradient(250, 190, 18, 256, 290, 240);
  gradient.addColorStop(0, "#ffb3c6");
  gradient.addColorStop(0.35, "#ff4d6d");
  gradient.addColorStop(0.72, "#e11d48");
  gradient.addColorStop(1, "#9f1239");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gloss = ctx.createRadialGradient(210, 160, 0, 210, 160, 130);
  gloss.addColorStop(0, "rgba(255,255,255,0.38)");
  gloss.addColorStop(0.55, "rgba(255,255,255,0.08)");
  gloss.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
