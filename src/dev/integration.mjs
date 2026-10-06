// Design mode: a dev-only panel for tweaking src/styles/tokens.css on real pages.
// Nothing here runs in `astro build`.
import { appendFile, copyFile, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../../", import.meta.url);
const TOKENS = fileURLToPath(new URL("src/styles/tokens.css", root));
const SITE = fileURLToPath(new URL("src/site.ts", root));
const FONTS_CSS = fileURLToPath(new URL("src/styles/fonts.css", root));
const LAB = new URL("src/dev/fonts/", root);
const PUBLIC_FONTS = new URL("public/fonts/", root);

const SAFE_VALUE = /^[^;{}<>\n\\]{1,200}$/;
const SAFE_LOGO = /^[^"\\\n<>]{1,40}$/;
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const firstFamily = (stack) =>
  String(stack)
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
const squash = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export async function save({ vars = {}, logo }) {
  let css = await readFile(TOKENS, "utf8");
  const changed = [];
  for (const [name, value] of Object.entries(vars)) {
    if (!/^--[a-z0-9-]+$/.test(name) || !SAFE_VALUE.test(String(value))) throw new Error(`bad token ${name}`);
    const re = new RegExp(`(^\\s*${escapeRe(name)}\\s*:\\s*)[^;]*;`, "m");
    if (!re.test(css)) throw new Error(`unknown token ${name}`);
    css = css.replace(re, (_, head) => `${head}${String(value).trim()};`);
    changed.push(name);
  }
  await writeFile(TOKENS, css);
  for (const [name, value] of Object.entries(vars)) {
    if (name.endsWith("-font")) {
      const shipped = await shipFont(value);
      if (shipped) changed.push(`shipped font ${shipped}`);
    }
  }
  if (logo !== undefined) {
    if (!SAFE_LOGO.test(logo)) throw new Error("bad logo text");
    const site = await readFile(SITE, "utf8");
    await writeFile(SITE, site.replace(/logo: "[^"]*"/, `logo: "${logo}"`));
    changed.push("logo");
  }
  for (const family of await pruneFonts()) changed.push(`removed unused font ${family}`);
  return changed;
}

// Delete fonts that no --*-font token uses: their @font-face rules, files and license.
export async function pruneFonts() {
  const tokens = await readFile(TOKENS, "utf8");
  const used = new Set([...tokens.matchAll(/^\s*--[a-z-]*font\s*:\s*([^;]+);/gm)].map((m) => firstFamily(m[1])));
  const removed = new Set();
  const files = [];
  // Each rule is "/* note */ @font-face { ... }"; drop the ones for unused families.
  const css = (await readFile(FONTS_CSS, "utf8")).replace(
    /(\/\*[^*]*?\*\/\s*)?@font-face\s*{([^}]*)}\s*/g,
    (rule, _note, body) => {
      const family = body.match(/font-family:\s*["']?([^"';]+?)["']?\s*;/)?.[1];
      if (!family || used.has(family)) return rule;
      removed.add(family);
      for (const [, file] of body.matchAll(/url\(\/fonts\/([^)]+)\)/g)) files.push(file);
      return "";
    },
  );
  if (!removed.size) return [];
  await writeFile(FONTS_CSS, css);
  for (const file of files) await rm(new URL(file, PUBLIC_FONTS), { force: true });
  for (const file of await readdir(PUBLIC_FONTS)) {
    const lic = file.match(/^LICENSE-(.+)\.txt$/);
    if (!lic) continue;
    const name = squash(lic[1]);
    if ([...removed].some((f) => squash(f).startsWith(name) || name.startsWith(squash(f)))) {
      await rm(new URL(file, PUBLIC_FONTS));
    }
  }
  return [...removed];
}

// When a saved font comes from the font lab, copy it (and its license) into public/fonts
// and add @font-face rules to fonts.css, so the built site has it.
async function shipFont(stack) {
  const family = firstFamily(stack);
  const fontsCss = await readFile(FONTS_CSS, "utf8");
  if (new RegExp(`font-family:\\s*["']?${escapeRe(family)}["']?\\s*;`).test(fontsCss)) return null;
  const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  let manifest = [];
  try {
    manifest = JSON.parse(await readFile(new URL("manifest.json", LAB), "utf8"));
  } catch {}
  const lab = manifest.find((f) => f.family === family);
  const rules = [];
  const face = (out, weight, format) =>
    rules.push(
      `@font-face { font-family: "${family}"; src: url(/fonts/${out}) format("${format}"); font-weight: ${weight}; font-display: swap; }`,
    );

  if (lab) {
    for (const [weight, file] of Object.entries(lab.files)) {
      const ext = file.split(".").pop();
      const out = `${slug}-${weight}.${ext}`;
      await copyFile(new URL(file, LAB), new URL(out, PUBLIC_FONTS));
      face(out, weight, ext === "otf" ? "opentype" : ext === "ttf" ? "truetype" : ext);
    }
    if (lab.license) await copyFile(new URL(lab.license, LAB), new URL(`LICENSE-${slug}.txt`, PUBLIC_FONTS));
    await appendFile(FONTS_CSS, `\n/* ${family}: ${lab.by ?? ""} ${lab.source ?? ""} */\n${rules.join("\n")}\n`);
    return family;
  }

  // Not in the lab: a font picked from the live Fontsource search.
  const catalog = await (await fetch("https://api.fontsource.org/v1/fonts")).json();
  const fs = catalog.find((f) => f.family === family);
  if (!fs) return null;
  const weights = [300, 400, 700, 900].filter((w) => fs.weights.includes(w));
  if (!weights.length) weights.push(fs.weights[0]);
  for (const w of weights) {
    const res = await fetch(`https://cdn.jsdelivr.net/fontsource/fonts/${fs.id}@latest/latin-${w}-normal.woff2`);
    if (!res.ok) continue;
    const out = `${slug}-${w}.woff2`;
    await writeFile(new URL(out, PUBLIC_FONTS), Buffer.from(await res.arrayBuffer()));
    face(out, w, "woff2");
  }
  const license = await fetch(`https://cdn.jsdelivr.net/npm/@fontsource/${fs.id}/LICENSE`);
  if (license.ok)
    await writeFile(new URL(`LICENSE-${slug}.txt`, PUBLIC_FONTS), Buffer.from(await license.arrayBuffer()));
  await appendFile(
    FONTS_CSS,
    `\n/* ${family}: ${fs.license} via https://fontsource.org/fonts/${fs.id} */\n${rules.join("\n")}\n`,
  );
  return family;
}
export default function designMode() {
  return {
    name: "design-mode",
    hooks: {
      "astro:config:setup": ({ command, injectScript, injectRoute }) => {
        if (command !== "dev") return;
        injectScript("page", `import "/src/dev/design-mode.js";`);
        injectRoute({ pattern: "/__fonts", entrypoint: new URL("./FontLab.astro", import.meta.url) });
      },
      "astro:server:setup": ({ server, logger }) => {
        server.middlewares.use("/__design/save", (req, res) => {
          if (req.method !== "POST") return void res.writeHead(405).end();
          let body = "";
          req.on("data", (c) => (body += c));
          req.on("end", async () => {
            try {
              const changed = await save(JSON.parse(body));
              logger.info(`saved ${changed.join(", ") || "nothing"}`);
              res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ changed }));
            } catch (e) {
              res
                .writeHead(400, { "content-type": "application/json" })
                .end(JSON.stringify({ error: String(e.message) }));
            }
          });
        });
      },
    },
  };
}
