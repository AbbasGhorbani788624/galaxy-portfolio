import * as THREE from "three";

export const PYTHON_CAKE = {
  blue: "#3776ab",
  yellow: "#ffd43b",
  editorBg: "#0d1117",
  editorPanel: "#161b22",
  keyword: "#ff7b72",
  string: "#a5d6ff",
  comment: "#6a737d",
  fn: "#d2a8ff",
  text: "#e6edf3",
  accent: "#22d3ee",
};

type CodeLine = { text: string; color: string };

const BASE_LINES: CodeLine[] = [
  { text: "# birthday.py", color: PYTHON_CAKE.comment },
  { text: "import torch", color: PYTHON_CAKE.string },
  { text: "import torch.nn as nn", color: PYTHON_CAKE.string },
  { text: "from dataclasses import dataclass", color: PYTHON_CAKE.string },
  { text: "", color: PYTHON_CAKE.text },
  { text: "SKILLS = [", color: PYTHON_CAKE.text },
  { text: '    "Python",', color: PYTHON_CAKE.string },
  { text: '    "AI",', color: PYTHON_CAKE.string },
  { text: '    "Hard work",', color: PYTHON_CAKE.string },
  { text: "]", color: PYTHON_CAKE.text },
];

const TOP_LINES: CodeLine[] = [
  { text: "@dataclass", color: PYTHON_CAKE.fn },
  { text: "class Shakila:", color: PYTHON_CAKE.keyword },
  { text: '    name: str = "Shakila"', color: PYTHON_CAKE.text },
  { text: "    amazing: bool = True", color: PYTHON_CAKE.text },
  { text: "", color: PYTHON_CAKE.text },
  { text: "    def make_wish(self):", color: PYTHON_CAKE.fn },
  { text: '        return "Happy Birthday ✦"', color: PYTHON_CAKE.string },
  { text: "", color: PYTHON_CAKE.text },
  { text: "if __name__ == '__main__':", color: PYTHON_CAKE.keyword },
  { text: "    Shakila().make_wish()", color: PYTHON_CAKE.text },
];

function drawCodeBlock(
  ctx: CanvasRenderingContext2D,
  lines: CodeLine[],
  width: number,
  height: number,
  bg: string
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = PYTHON_CAKE.blue;
  ctx.fillRect(0, 0, width, 28);
  ctx.fillStyle = PYTHON_CAKE.yellow;
  ctx.beginPath();
  ctx.arc(16, 14, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff55";
  ctx.beginPath();
  ctx.arc(width - 16, 14, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '500 15px "Consolas", "Courier New", monospace';
  const lineHeight = 22;
  let y = 44;

  for (const line of lines) {
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, 14, y);
    y += lineHeight;
    if (y > height - 10) break;
  }
}

export function createPythonCodeTexture(
  lines: CodeLine[],
  bg = PYTHON_CAKE.editorBg
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unsupported");

  drawCodeBlock(ctx, lines, canvas.width, canvas.height, bg);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.2, 1.4);
  texture.anisotropy = 8;
  return texture;
}

export const pythonCakeTextures = {
  base: createPythonCodeTexture(BASE_LINES, PYTHON_CAKE.editorPanel),
  top: createPythonCodeTexture(TOP_LINES, PYTHON_CAKE.editorBg),
};

export function createPythonSnakeCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.2, 0.02, 0.05),
    new THREE.Vector3(-0.08, 0.14, 0.08),
    new THREE.Vector3(0.06, 0.18, -0.02),
    new THREE.Vector3(0.18, 0.1, 0.04),
    new THREE.Vector3(0.22, 0.02, -0.06),
  ]);
}
