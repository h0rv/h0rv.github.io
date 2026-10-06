// Font lab: downloads open-license fonts for design mode. Dev only.
//
//   mise run fonts
//
// Sources:
//   - every font in the Velvetyne catalog (gitlab.com/velvetyne), found automatically
//   - a curated list of design-centric fonts from Fontsource (Google Fonts, OFL)
// Files land in src/dev/fonts/ (git-ignored). Design mode can also search and load any
// of Fontsource's ~2,000 open fonts on the fly; only fonts you Save are copied into
// public/fonts, with their license.
import { access, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = fileURLToPath(new URL("./fonts/", import.meta.url));
const GITLAB = "https://gitlab.com/api/v4";
const FONTSOURCE_CDN = "https://cdn.jsdelivr.net/fontsource/fonts";
const OFL_TEXT = "https://cdn.jsdelivr.net/npm/@fontsource/commit-mono/LICENSE";

// Velvetyne repos that are not typefaces, and roles for the ones that are.
const VELVETYNE_SKIP = new Set(["Velvetyne-Notdef", "Velvetyne-Standard-Character-Set", "velvetyne-libre-friends"]);
const VELVETYNE_NAME = { murmure: "Le Murmure", "format-1452": "Format 1452", "Facade-font": "Facade" };
const VELVETYNE_ROLE = {
  grotesk: "sans",
  lineal: "sans",
  "Sporting-Grotesque": "sans",
  compagnon: "mono",
  sligoil: "mono",
  vg5000: "mono",
  jgs: "mono",
  cantique: "serif",
  mourier: "serif",
  anthony: "serif",
};

// Fontsource picks, by role. Family names as on fontsource.org.
// biome-ignore format: long name lists read better packed
const CURATED = {
  display: [
    "Six Caps", "League Gothic", "Bebas Neue", "Anton", "Antonio", "Oswald", "Big Shoulders Display",
    "Barlow Condensed", "Saira Extra Condensed", "Pathway Gothic One", "Fjalla One", "Alumni Sans", "Teko",
    "Archivo Black", "Climate Crisis", "Unbounded", "Syne", "Funnel Display", "Bowlby One", "Rubik Mono One",
    "Dela Gothic One", "Tilt Warp", "Bagel Fat One", "Bungee", "Monoton", "Shrikhand", "Abril Fatface", "Syncopate",
    "Michroma", "Orbitron", "Krona One", "Lexend Zetta", "Major Mono Display", "Gruppo", "Poiret One", "Italiana",
    "Bodoni Moda", "DM Serif Display", "Playfair Display", "Rubik Dirt", "Nabla", "Rampart One", "Train One",
    "Reggae One", "Righteous", "Darker Grotesque", "Big Shoulders Stencil Display",
  ],
  sans: [
    "Inter", "Inter Tight", "Space Grotesk", "Instrument Sans", "Hanken Grotesk", "Schibsted Grotesk",
    "Familjen Grotesk", "Host Grotesk", "Bricolage Grotesque", "Funnel Sans", "Geist", "Archivo", "Archivo Narrow",
    "Public Sans", "Work Sans", "DM Sans", "Manrope", "Atkinson Hyperlegible Next", "Epilogue", "Sora", "Outfit",
    "Plus Jakarta Sans", "Lexend", "Red Hat Display", "Red Hat Text", "Chivo", "Karla", "Libre Franklin", "Rubik",
    "Jost", "Josefin Sans", "League Spartan", "Raleway", "Kanit", "Figtree", "Onest", "Albert Sans",
    "Be Vietnam Pro", "Urbanist", "Mona Sans", "Hubot Sans", "Wix Madefor Display", "Gantari", "Golos Text",
    "Radio Canada", "Overpass", "Barlow", "Source Sans 3", "Noto Sans", "Fira Sans", "Commissioner", "Anybody",
    "Gabarito", "Afacad",
  ],
  serif: [
    "Instrument Serif", "Newsreader", "Literata", "Fraunces", "Source Serif 4", "EB Garamond", "Cormorant",
    "Cormorant Garamond", "Crimson Pro", "Libre Caslon Text", "Libre Baskerville", "Young Serif", "Gloock",
    "Petrona", "Spectral", "Lora", "Gelasio", "Newsreader", "Brygada 1918", "Bitter", "Roboto Serif", "Noto Serif",
    "PT Serif", "Alegreya", "Merriweather", "Besley", "Piazzolla", "Zilla Slab", "Rozha One", "Castoro", "Imbue",
    "Gupter", "Linden Hill", "Sorts Mill Goudy", "Fanwood Text", "Junicode", "IM Fell English", "Old Standard TT",
    "Libre Bodoni", "Ibarra Real Nova",
  ],
  mono: [
    "JetBrains Mono", "Commit Mono", "Geist Mono", "Space Mono", "DM Mono", "Fragment Mono", "Martian Mono",
    "Red Hat Mono", "Victor Mono", "Spline Sans Mono", "Chivo Mono", "Azeret Mono", "Xanh Mono", "Sometype Mono",
    "Anonymous Pro", "Overpass Mono", "Courier Prime", "Cutive Mono", "Fira Code", "Source Code Pro", "Ubuntu Mono",
    "Noto Sans Mono", "Roboto Mono", "Inconsolata", "Cousine", "Nanum Gothic Coding", "Syne Mono", "Kode Mono",
    "Reddit Mono", "M PLUS 1 Code", "Share Tech Mono", "VT323", "Silkscreen", "Press Start 2P", "Pixelify Sans",
  ],
};

// No IBM Plex, by request.
const WANT = [300, 400, 700, 900];
const WEIGHT_WORDS = [
  [/hairline|thin/i, 100],
  [/extra.?light|ultra.?light/i, 200],
  [/light/i, 300],
  [/medium/i, 500],
  [/semi.?bold|demi/i, 600],
  [/extra.?bold|ultra.?bold/i, 800],
  [/black|heavy/i, 900],
  [/bold|gras/i, 700],
  [/regular|roman|book|normal|^$/i, 400],
];
// A weight word at the end of a style name, capitalized ("MicroBold", "03Regular").
const WEIGHT_TAIL =
  /(Extra|Ultra|Semi|Demi)?\s*(Hairline|Thin|Light|Regular|Roman|Book|Normal|Medium|Bold|Gras|Black|Heavy)$/;
const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const exists = (p) =>
  access(p).then(
    () => true,
    () => false,
  );
const titleCase = (s) => s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}
async function json(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}
async function save(dir, name, url) {
  const path = join(dir, name);
  if (!(await exists(path))) await writeFile(path, await get(url));
}

// ---------- Velvetyne ----------

async function velvetyne() {
  const projects = await json(`${GITLAB}/groups/velvetyne/projects?per_page=100`);
  const fonts = [];
  for (const p of projects) {
    if (VELVETYNE_SKIP.has(p.path)) continue;
    try {
      const tree = await json(`${GITLAB}/projects/${p.id}/repository/tree?recursive=true&per_page=100`);
      const all = tree
        .map((t) => t.path)
        .filter((f) => /\.(woff2|otf|ttf)$/i.test(f))
        .filter((f) => !/(^|\/)(source|sources|documentation|specimen|webspecimen|old|archive)/i.test(f))
        .filter((f) => !/(VF|variable|italic|oblique)/i.test(f));
      // One format per repo: woff2 if there is any, else otf, else ttf.
      const ext = ["woff2", "otf", "ttf"].find((e) => all.some((f) => f.toLowerCase().endsWith(e)));
      const byStyle = new Map();
      for (const f of all.filter((f) => f.toLowerCase().endsWith(ext))) {
        const style = f
          .split("/")
          .pop()
          .replace(/\.\w+$/, "");
        const key = style.toLowerCase();
        if (!byStyle.has(key)) byStyle.set(key, f);
      }
      if (!byStyle.size) continue;
      const base = VELVETYNE_NAME[p.path] ?? titleCase(p.path.replace(/-font$/i, ""));
      const license = await get(`https://gitlab.com/velvetyne/${p.path}/-/raw/HEAD/LICENSE.txt`).catch(() => null);
      const by = (p.description || "").slice(0, 120) || "Velvetyne";

      // Group styles into families: weight words become weights, anything else its own family.
      const families = new Map();
      for (const [, file] of byStyle) {
        const name = file
          .split("/")
          .pop()
          .replace(/\.\w+$/, "");
        const suffix = name
          .split(/[-_ ]/)
          .slice(1)
          .join(" ")
          .replace(/^\d+/, "")
          .replace(/\b(web|webfont|font|master|ng)\b/gi, "")
          .replace(/\s+/g, " ")
          .trim();
        // "MicroBold" -> "Sligoil Micro" 700; "Sud" -> "Facade Sud" 400; "Moonlight" stays a name.
        const tail =
          suffix.match(WEIGHT_TAIL) ??
          suffix.match(new RegExp(`^${WEIGHT_TAIL.source}`, "i")) ??
          suffix.match(new RegExp(`(?<=\\s)${WEIGHT_TAIL.source}`, "i"));
        const w = tail ? WEIGHT_WORDS.find(([re]) => re.test(tail[0]))[1] : 400;
        const rest = (tail ? suffix.slice(0, tail.index) : suffix)
          .replace(/\b(web|webfont|font|master|ng)\b/gi, "")
          .replace(new RegExp(`\\b${base.split(" ").pop()}\\b`, "i"), "")
          .replace(/\s+/g, " ")
          .trim();
        const family = rest ? `${base} ${titleCase(rest)}` : base;
        if (!families.has(family)) families.set(family, {});
        if (!families.get(family)[w]) families.get(family)[w] = file;
      }
      // Parametric families (e.g. Fungal) ship dozens of instances; keep a spread of 4.
      let entries = [...families];
      if (entries.length > 4) entries = [0, 1, 2, 3].map((i) => entries[Math.round((i * (entries.length - 1)) / 3)]);
      for (const [family, map] of entries) {
        fonts.push({
          family,
          role: VELVETYNE_ROLE[p.path] ?? "display",
          by,
          source: p.web_url,
          repo: p.path,
          map,
          license,
        });
      }
    } catch (e) {
      console.log(`✗ velvetyne/${p.path}: ${e.message}`);
    }
  }
  return fonts;
}

async function fetchVelvetyne(f) {
  const id = slug(f.family);
  const dir = join(OUT, id);
  await mkdir(dir, { recursive: true });
  const files = {};
  for (const [w, path] of Object.entries(f.map)) {
    const name = `${w}.${path.split(".").pop().toLowerCase()}`;
    await save(
      dir,
      name,
      `https://gitlab.com/velvetyne/${f.repo}/-/raw/HEAD/${path.split("/").map(encodeURIComponent).join("/")}`,
    );
    files[w] = `${id}/${name}`;
  }
  let license = f.license;
  if (!license)
    license = Buffer.concat([
      Buffer.from(
        `${f.family}. Copyright (c) ${f.by}. Source: ${f.source}\nLicensed under the SIL Open Font License (stated in the source repository).\n\n`,
      ),
      await get(OFL_TEXT),
    ]);
  await writeFile(join(dir, "LICENSE.txt"), license);
  return { family: f.family, role: f.role, by: f.by, source: f.source, license: `${id}/LICENSE.txt`, files };
}

// ---------- Fontsource ----------

async function fetchFontsource(family, role, catalog) {
  const meta = catalog.get(family);
  if (!meta) throw new Error("not on Fontsource");
  const id = slug(family);
  const dir = join(OUT, id);
  await mkdir(dir, { recursive: true });
  const weights = WANT.filter((w) => meta.weights.includes(w));
  if (!weights.length) weights.push(meta.weights.includes(400) ? 400 : meta.weights[0]);
  const subset = meta.subsets.includes("latin") ? "latin" : meta.defSubset;
  const files = {};
  for (const w of weights) {
    await save(dir, `${w}.woff2`, `${FONTSOURCE_CDN}/${meta.id}@latest/${subset}-${w}-normal.woff2`);
    files[w] = `${id}/${w}.woff2`;
  }
  const license = await get(`https://cdn.jsdelivr.net/npm/@fontsource/${meta.id}/LICENSE`).catch(() => null);
  if (license) await writeFile(join(dir, "LICENSE.txt"), license);
  return {
    family,
    role,
    by: `${meta.license} via Fontsource`,
    source: `https://fontsource.org/fonts/${meta.id}`,
    license: license ? `${id}/LICENSE.txt` : null,
    files,
  };
}

// ---------- run ----------

await mkdir(OUT, { recursive: true });
const manifest = [];
const seen = new Set();
let failed = 0;

console.log("Velvetyne catalog…");
for (const f of await velvetyne()) {
  if (seen.has(f.family)) continue;
  try {
    manifest.push(await fetchVelvetyne(f));
    seen.add(f.family);
  } catch (e) {
    failed++;
    console.log(`✗ ${f.family}: ${e.message}`);
  }
}

console.log("Fontsource picks…");
const catalog = new Map((await json("https://api.fontsource.org/v1/fonts")).map((m) => [m.family, m]));
for (const [role, families] of Object.entries(CURATED)) {
  for (const family of families) {
    if (seen.has(family)) continue;
    try {
      manifest.push(await fetchFontsource(family, role, catalog));
      seen.add(family);
    } catch (e) {
      failed++;
      console.log(`✗ ${family}: ${e.message}`);
    }
  }
}

await writeFile(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
// Drop folders for fonts no longer in the list.
const keep = new Set(manifest.flatMap((f) => Object.values(f.files).map((p) => p.split("/")[0])));
for (const d of await readdir(OUT, { withFileTypes: true })) {
  if (d.isDirectory() && !keep.has(d.name)) await rm(join(OUT, d.name), { recursive: true });
}
const count = (role) => manifest.filter((f) => f.role === role).length;
console.log(
  `\n${manifest.length} fonts (display ${count("display")}, sans ${count("sans")}, serif ${count("serif")}, mono ${count("mono")}), ${failed} skipped`,
);
console.log("Design mode can also search all of Fontsource live.");
