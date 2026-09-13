import * as THREE from "three";

export const PALETTE = {
  cyan: 0x22d3ee,
  pythonBlue: 0x3776ab,
  pythonYellow: 0xffd43b,
  bodyDark: 0x1a1a2e,
  bodyMid: 0x2d2d44,
  screenBg: 0x0d1117,
  white: 0xf0f0f0,
};

export interface ProceduralParts {
  laptop: THREE.Group;
  laptopDisplay: THREE.Mesh;
  laptopTexture: THREE.CanvasTexture;
  headphones: THREE.Group;
}

export interface ProceduralCharacter {
  root: THREE.Group;
  lookPivot: THREE.Group;
  headPivot: THREE.Group;
  upperBodyPivot: THREE.Group;
  parts: ProceduralParts;
  update: (elapsed: number, mouse: { x: number; y: number }) => void;
  dispose: () => void;
}

const solidMat = (color: number, opts: { metalness?: number; roughness?: number; emissive?: number } = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: opts.emissive ?? 0,
    metalness: opts.metalness ?? 0.35,
    roughness: opts.roughness ?? 0.55,
  });

const SCREEN_W = 640;
const SCREEN_H = 480;

const CODE_LINES: { text: string; color: string }[] = [
  { text: "# Python + AI — main.py", color: "#6a737d" },
  { text: "import torch", color: "#79c0ff" },
  { text: "import torch.nn as nn", color: "#79c0ff" },
  { text: "import numpy as np", color: "#79c0ff" },
  { text: "from dataclasses import dataclass", color: "#79c0ff" },
  { text: "", color: "#e6edf3" },
  { text: "@dataclass", color: "#d2a8ff" },
  { text: "class Developer:", color: "#ff7b72" },
  { text: '    name: str = "Shakila"', color: "#e6edf3" },
  { text: "    skills: list = None", color: "#e6edf3" },
  { text: "", color: "#e6edf3" },
  { text: "    def __post_init__(self):", color: "#d2a8ff" },
  { text: '        self.skills = ["Python", "AI"]', color: "#a5d6ff" },
  { text: "", color: "#e6edf3" },
  { text: "    def train_model(self, data):", color: "#d2a8ff" },
  { text: "        model = nn.Sequential(", color: "#e6edf3" },
  { text: "            nn.Linear(128, 64),", color: "#e6edf3" },
  { text: "            nn.ReLU(),", color: "#e6edf3" },
  { text: "            nn.Linear(64, 10),", color: "#e6edf3" },
  { text: "        )", color: "#e6edf3" },
  { text: "        return model(data)", color: "#e6edf3" },
  { text: "", color: "#e6edf3" },
  { text: "    def code(self):", color: "#d2a8ff" },
  { text: '        return f"{self.name} ❤️ coding"', color: "#a5d6ff" },
  { text: "", color: "#e6edf3" },
  { text: "if __name__ == '__main__':", color: "#ff7b72" },
  { text: "    dev = Developer()", color: "#e6edf3" },
  { text: "    print(dev.code())", color: "#e6edf3" },
  { text: "    dev.train_model(data)", color: "#e6edf3" },
  { text: '    print("Done ✦")', color: "#a5d6ff" },
];

const drawPythonScreen = (
  ctx: CanvasRenderingContext2D,
  cursorLine = 0,
  scroll = 0
) => {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  ctx.fillStyle = "#161b22";
  ctx.fillRect(0, 0, SCREEN_W, 36);
  ctx.fillStyle = "#ff5f57";
  ctx.beginPath();
  ctx.arc(18, 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#febc2e";
  ctx.beginPath();
  ctx.arc(36, 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#28c840";
  ctx.beginPath();
  ctx.arc(54, 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8b949e";
  ctx.font = "14px monospace";
  ctx.fillText("main.py — Python + AI", 72, 23);

  const lineHeight = 15;
  const fontSize = 16;
  ctx.font = `bold ${fontSize}px Consolas, monospace`;

  CODE_LINES.forEach(({ text, color }, i) => {
    const y = 52 + i * lineHeight - scroll;
    if (y < 44 || y > SCREEN_H - 8) return;
    ctx.fillStyle = color;
    ctx.fillText(text, 16, y);
    if (i === cursorLine % CODE_LINES.length && text) {
      ctx.fillStyle = "#58a6ff";
      const tw = ctx.measureText(text).width;
      ctx.fillRect(18 + tw, y - 13, 2, 14);
    }
  });
};

const createLaptop = () => {
  const laptop = new THREE.Group();

  // keyboard base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.05, 1.05),
    solidMat(PALETTE.bodyMid, { roughness: 0.45 })
  );
  laptop.add(base);

  const trackpad = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.008, 0.28),
    solidMat(0x3a3a52, { roughness: 0.7 })
  );
  trackpad.position.set(0, 0.03, 0.28);
  laptop.add(trackpad);

  // keyboard keys hint
  const keys = new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 0.006, 0.55),
    solidMat(0x252538, { roughness: 0.8 })
  );
  keys.position.set(0, 0.028, -0.12);
  laptop.add(keys);

  // screen hinge
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.025, -0.52);

  const lid = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 0.04, 1.15),
    solidMat(PALETTE.bodyDark, { roughness: 0.4 })
  );
  lid.position.set(0, 0.58, 0.575);
  hinge.add(lid);

  // screen bezel
  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(1.48, 0.02, 1.06),
    solidMat(0x111118, { roughness: 0.6 })
  );
  bezel.position.set(0, 0.58, 0.558);
  hinge.add(bezel);

  const canvas = document.createElement("canvas");
  canvas.width = SCREEN_W;
  canvas.height = SCREEN_H;
  const ctx = canvas.getContext("2d")!;
  drawPythonScreen(ctx, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(1.38, 1.035),
    new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: 0xffffff,
      emissiveIntensity: 1.4,
      roughness: 0.3,
      metalness: 0.1,
    })
  );
  display.position.set(0, 0.58, 0.568);
  hinge.add(display);

  // python badge on lid back
  const badge = new THREE.Mesh(
    new THREE.PlaneGeometry(0.18, 0.18),
    new THREE.MeshStandardMaterial({
      color: PALETTE.pythonBlue,
      emissive: PALETTE.pythonYellow,
      emissiveIntensity: 0.3,
      roughness: 0.4,
    })
  );
  badge.position.set(0, 0.58, -0.02);
  badge.rotation.x = Math.PI;
  hinge.add(badge);

  hinge.rotation.x = -1.05;
  laptop.add(hinge);

  laptop.position.set(0, 0.42, 0);

  return { laptop, display, texture, ctx };
};

const matteHeadphone = (color = 0x181818) =>
  solidMat(color, { roughness: 0.72, metalness: 0.12 });

const createHeadphones = () => {
  const group = new THREE.Group();
  // standing upright beside laptop, 3/4 angle toward camera
  group.position.set(1.05, 0.445, 0.18);
  group.rotation.y = -0.42;
  group.scale.setScalar(1.05);

  const bandRadius = 0.4;
  const bandY = 0.78;

  // padded headband arch — peak points up, cups hang from the ends
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(bandRadius, 0.052, 16, 72, Math.PI),
    matteHeadphone(0x141414)
  );
  band.position.set(0, bandY, 0);
  group.add(band);

  const bandPad = new THREE.Mesh(
    new THREE.TorusGeometry(bandRadius - 0.03, 0.024, 10, 56, Math.PI),
    matteHeadphone(0x222222)
  );
  bandPad.position.set(0, bandY + 0.01, 0.018);
  group.add(bandPad);

  [-1, 1].forEach((side) => {
    const cupPivot = new THREE.Group();
    cupPivot.position.set(side * bandRadius, bandY, 0);
    group.add(cupPivot);

    // hinge / slider arm (connects band end to cup)
    const hinge = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, 0.09, 0.055),
      matteHeadphone(0x202020)
    );
    hinge.position.set(0, 0.06, 0.01);
    cupPivot.add(hinge);

    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.12, 0.048),
      matteHeadphone(0x1a1a1a)
    );
    arm.position.set(0, -0.02, 0.01);
    cupPivot.add(arm);

    // outer ear-cup shell — large round disc facing inward
    const cupShell = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.1, 36),
      matteHeadphone(0x121212)
    );
    cupShell.rotation.z = Math.PI / 2;
    cupShell.rotation.y = -side * 0.12;
    cupShell.position.set(side * 0.03, -0.2, 0.05);
    cupPivot.add(cupShell);

    // outer face plate (flat disc like reference photo)
    const facePlate = new THREE.Mesh(
      new THREE.CylinderGeometry(0.165, 0.165, 0.012, 36),
      matteHeadphone(0x252525)
    );
    facePlate.rotation.copy(cupShell.rotation);
    facePlate.position.set(side * 0.03, -0.2, 0.105);
    cupPivot.add(facePlate);

    // plush ear cushion (torus ring)
    const earPad = new THREE.Mesh(
      new THREE.TorusGeometry(0.14, 0.038, 14, 36),
      matteHeadphone(0x2e2e2e)
    );
    earPad.rotation.y = Math.PI / 2;
    earPad.rotation.x = side * 0.08;
    earPad.position.set(side * 0.03, -0.2, 0.048);
    cupPivot.add(earPad);

    // inner cup well
    const innerCup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 0.02, 32),
      matteHeadphone(0x1f1f1f)
    );
    innerCup.rotation.copy(cupShell.rotation);
    innerCup.position.set(side * 0.03, -0.2, 0.058);
    cupPivot.add(innerCup);
  });

  return group;
};

export const buildProceduralCharacter = (): ProceduralCharacter => {
  const root = new THREE.Group();
  root.name = "DevDeskSetup";
  root.scale.setScalar(0.72);

  const lookPivot = new THREE.Group();
  lookPivot.position.set(0, 0.95, 0);
  root.add(lookPivot);

  const headPivot = lookPivot;
  const upperBodyPivot = new THREE.Group();
  upperBodyPivot.position.set(0, 0.6, 0);
  root.add(upperBodyPivot);

  const { laptop, display, texture, ctx } = createLaptop();
  root.add(laptop);

  const headphones = createHeadphones();
  root.add(headphones);

  // subtle desk shadow plane
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.1, 32),
    new THREE.MeshStandardMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.25,
      roughness: 1,
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.38;
  root.add(shadow);

  root.userData.lookPivot = lookPivot;

  let cursorLine = 0;
  let cursorTimer = 0;
  let codeScroll = 0;
  const maxScroll = Math.max(0, CODE_LINES.length * 15 - (SCREEN_H - 60));

  const parts: ProceduralParts = {
    laptop,
    laptopDisplay: display,
    laptopTexture: texture,
    headphones,
  };

  const update = (elapsed: number, mouse: { x: number; y: number }) => {
    cursorTimer += 0.016;
    if (cursorTimer > 0.4) {
      cursorTimer = 0;
      cursorLine++;
    }

    codeScroll += 0.06;
    if (codeScroll > maxScroll) codeScroll = 0;

    drawPythonScreen(ctx, cursorLine, codeScroll);
    texture.needsUpdate = true;

    const screenMat = display.material as THREE.MeshStandardMaterial;
    screenMat.emissiveIntensity = 1.3 + Math.sin(elapsed * 2) * 0.15;

    root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, mouse.x * 0.12, 0.05);
    root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, -mouse.y * 0.04, 0.05);
  };

  const dispose = () => {
    texture.dispose();
    root.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const material = child.material;
        if (Array.isArray(material)) material.forEach((m) => m.dispose());
        else {
          if ((material as THREE.MeshStandardMaterial).map)
            (material as THREE.MeshStandardMaterial).map?.dispose();
          material.dispose();
        }
      }
    });
  };

  return {
    root,
    lookPivot,
    headPivot,
    upperBodyPivot,
    parts,
    update,
    dispose,
  };
};
