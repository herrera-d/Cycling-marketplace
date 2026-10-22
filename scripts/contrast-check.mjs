// Auditoría de contraste (WCAG 2.1/2.2 AA) sobre los tokens de `app/globals.css`.
// Uso: node scripts/contrast-check.mjs
//
// Los tokens se LEEN del CSS (no están duplicados aquí): si alguien cambia
// `app/globals.css` y olvida esta auditoría, el script mide el valor real y
// falla si deja de cumplir. oklch → sRGB → luminancia relativa. Los tokens
// con alfa se componen sobre `background` antes de medir.

import { readFileSync } from "node:fs";
import { dirname, resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");
const CSS_PATH = resolvePath(ROOT, "app/globals.css");

const toLinear = (l, c, hDeg) => {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m = l - 0.1055613458 * a - 0.0638541728 * b;
  const s = l - 0.0894841775 * a - 1.291485548 * b;
  const l3 = l_ ** 3;
  const m3 = m ** 3;
  const s3 = s ** 3;
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

/** Extrae las declaraciones `--token: valor;` de un bloque del CSS. */
const readBlock = (css, selector) => {
  // Escapa el selector para `RegExp` y busca el bloque balanceado `{ ... }`.
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const start = css.search(new RegExp(`(^|[\\s}])${escaped}\\s*\\{`));
  if (start === -1) return null;
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        const body = css.slice(open + 1, i);
        const tokens = {};
        for (const m of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
          tokens[m[1]] = m[2].trim();
        }
        return tokens;
      }
    }
  }
  return null;
};

const css = readFileSync(CSS_PATH, "utf8");

const tokens = {
  light: readBlock(css, ":root"),
  dark: readBlock(css, ".dark"),
};

for (const [theme, t] of Object.entries(tokens)) {
  if (!t) {
    console.error(`❌ No se pudo leer el bloque de tokens para "${theme}"`);
    process.exit(1);
  }
}

// [rótulo, fg, bg, mínimo]
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
let missing = 0;

console.log(`Tokens leídos de ${CSS_PATH.replace(ROOT + "/", "")}\n`);

for (const theme of Object.keys(tokens)) {
  const t = tokens[theme];
  console.log(`=== ${theme} ===`);
  for (const [label, fg, bg, min] of pairs) {
    if (!t[fg] || !t[bg]) {
      console.log(`⚠️  ${label.padEnd(34)} token ausente (${fg} / ${bg})`);
      missing++;
      continue;
    }
    const a = resolve(t[fg], t[bg]).srgb;
    const b = resolve(t[bg], t.background).srgb;
    const r = ratioSrgb(a, b);
    const ok = r >= min;
    if (!ok) fail++;
    console.log(
      `${ok ? "✅" : "❌"} ${label.padEnd(34)} ${r.toFixed(2)}:1  (mín ${min})`,
    );
  }
  console.log("");
}

if (missing > 0) {
  console.log(`⚠️  ${missing} comprobaciones sin token`);
}
console.log(
  fail === 0 ? "✅ TODO OK" : `❌ ${fail} pares bajo el mínimo`,
);
process.exit(fail === 0 && missing === 0 ? 0 : 1);
