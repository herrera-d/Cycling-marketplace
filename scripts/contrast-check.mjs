// Auditoría de contraste (WCAG 2.1/2.2 AA) sobre los tokens de `app/globals.css`.
// Uso: node scripts/contrast-check.mjs
// oklch → sRGB → luminancia relativa. Los tokens con alfa (`border`, `input`)
// se componen sobre `background` antes de medir.

const toLinear = (l, c, hDeg) => {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;
  return [
    4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  ];
};

const encode = (v) =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * Math.max(v, 0) ** (1 / 2.4) - 0.055;

const parse = (s) => {
  const n = s.match(/-?\d+(\.\d+)?/g).map(Number);
  return [n[0], n[1], n[2]];
};

const toSrgb = (oklch) =>
  toLinear(...parse(oklch)).map((v) => encode(Math.min(1, Math.max(0, v))));

const lin = (v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);

const luminanceSrgb = ([r, g, b]) =>
  0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);


// Resuelve un token: si trae alfa, lo compone sobre el fondo indicado.
const resolve = (token, background) => {
  const alphaMatch = token.match(/\/\s*([\d.]+)\s*%?\s*\)/);
  if (!alphaMatch) return { srgb: toSrgb(token) };
  const alpha = Number(alphaMatch[1]) / 100;
  const fg = toSrgb(token.replace(/\s*\/\s*[\d.]+\s*%?\s*\)/, ")"));
  const bg = toSrgb(background);
  return { srgb: fg.map((v, i) => v * alpha + bg[i] * (1 - alpha)) };
};

const ratioSrgb = (a, b) => {
  const [x, y] = [luminanceSrgb(a), luminanceSrgb(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const tokens = {
  light: {
    background: "oklch(0.995 0.002 85)",
    foreground: "oklch(0.17 0.01 85)",
    card: "oklch(1 0 0)",
    primary: "oklch(0.52 0.18 150)",
    "primary-foreground": "oklch(0.985 0 0)",
    secondary: "oklch(0.965 0.004 85)",
    "secondary-foreground": "oklch(0.205 0.01 85)",
    muted: "oklch(0.965 0.004 85)",
    "muted-foreground": "oklch(0.52 0.01 85)",
    accent: "oklch(0.94 0.02 150)",
    "accent-foreground": "oklch(0.35 0.09 150)",
    destructive: "oklch(0.577 0.245 27.325)",
    ring: "oklch(0.62 0.17 150)",
    border: "oklch(0.9 0.004 85)",
    input: "oklch(0.65 0.004 85)",
  },
  dark: {
    background: "oklch(0.15 0.005 85)",
    foreground: "oklch(0.97 0.002 85)",
    card: "oklch(0.195 0.006 85)",
    primary: "oklch(0.72 0.17 150)",
    "primary-foreground": "oklch(0.14 0.02 150)",
    secondary: "oklch(0.26 0.006 85)",
    "secondary-foreground": "oklch(0.97 0.002 85)",
    muted: "oklch(0.26 0.006 85)",
    "muted-foreground": "oklch(0.68 0.005 85)",
    accent: "oklch(0.28 0.06 150)",
    "accent-foreground": "oklch(0.85 0.1 150)",
    destructive: "oklch(0.704 0.191 22.216)",
    ring: "oklch(0.65 0.15 150)",
    border: "oklch(1 0 0 / 10%)",
    input: "oklch(0.52 0.004 85)",
  },
};

// [rotulo, fg, bg, minimo]
const pairs = [
  ["texto base", "foreground", "background", 4.5],
  ["texto en card", "foreground", "card", 4.5],
  ["texto secundario", "muted-foreground", "background", 4.5],
  ["texto secundario en card", "muted-foreground", "card", 4.5],
  ["botón primario", "primary-foreground", "primary", 4.5],
  ["enlace/botón texto primary", "primary", "background", 4.5],
  ["botón secundario", "secondary-foreground", "secondary", 4.5],
  ["badge acento", "accent-foreground", "accent", 4.5],
  ["texto destructivo", "destructive", "background", 4.5],
  ["borde de input (1.4.11)", "input", "background", 3],
  ["focus ring vs background (2.4.11)", "ring", "background", 3],
  ["focus ring vs card", "ring", "card", 3],
];

let fail = 0;
for (const theme of Object.keys(tokens)) {
  console.log(`\n=== ${theme} ===`);
  for (const [label, fg, bg, min] of pairs) {
    const t = tokens[theme];
    const a = resolve(t[fg], t[bg]).srgb;
    const b = resolve(t[bg], t.background).srgb;
    const r = ratioSrgb(a, b);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(
      `${ok ? "✅" : "❌"} ${label.padEnd(34)} ${r.toFixed(2)}:1  (mín ${min})`,
    );
  }
}
console.log(`\n${fail === 0 ? "TODO OK" : `❌ ${fail} pares bajo el mínimo`}`);
