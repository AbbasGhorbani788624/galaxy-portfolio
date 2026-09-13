import * as THREE from "three";

export const ROYAL_PALETTE = {
  blush: "#f5d0d6",
  rose: "#e8a0b4",
  deepRose: "#c76b8a",
  champagne: "#f7ede2",
  ivory: "#fffaf5",
  gold: "#d4af37",
  goldLight: "#f5d78e",
  goldDark: "#9a7b2c",
  ruby: "#c41e3a",
  emerald: "#2e8b57",
  sapphire: "#4169e1",
  amethyst: "#9966cc",
  stand: "#2a1810",
  standRim: "#b8922a",
  plate: "#1c1210",
  wick: "#2d1810",
  flameOuter: "#ff8c42",
  flameInner: "#fff4d6",
  smoke: "#e8dcc8",
};

function addFondantNoise(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  base: string,
  noiseAlpha = 0.06
) {
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, width, height);

  const imageData = ctx.getImageData(0, 0, width, height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 18;
    imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + n));
    imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + n));
    imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + n));
    imageData.data[i + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);

  ctx.globalAlpha = noiseAlpha;
  for (let i = 0; i < 120; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const r = 8 + Math.random() * 40;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGoldFoil(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  ctx.fillStyle = ROYAL_PALETTE.goldDark;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < 280; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 4 + Math.random() * 28;
    const h = 1 + Math.random() * 3;
    const angle = Math.random() * Math.PI;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    const shade = 180 + Math.random() * 75;
    ctx.fillStyle = `rgba(${shade}, ${Math.floor(shade * 0.82)}, ${Math.floor(shade * 0.35)}, ${0.35 + Math.random() * 0.45})`;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  }

  const gloss = ctx.createLinearGradient(0, 0, width, height);
  gloss.addColorStop(0, "rgba(255,248,220,0.25)");
  gloss.addColorStop(0.5, "rgba(255,215,100,0.08)");
  gloss.addColorStop(1, "rgba(180,140,40,0.2)");
  ctx.fillStyle = gloss;
  ctx.fillRect(0, 0, width, height);
}

export function createFondantTexture(color: string): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  addFondantNoise(ctx, canvas.width, canvas.height, color);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  texture.anisotropy = 8;
  return texture;
}

export function createGoldFoilTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  drawGoldFoil(ctx, canvas.width, canvas.height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  return texture;
}

export const royalCakeTextures = {
  blush: createFondantTexture(ROYAL_PALETTE.blush),
  rose: createFondantTexture(ROYAL_PALETTE.rose),
  ivory: createFondantTexture(ROYAL_PALETTE.ivory),
  gold: createGoldFoilTexture(),
};
