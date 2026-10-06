// Design mode. Dev only (injected by src/dev/integration.mjs, never built).
// Press D to toggle. Tweaks live in localStorage until you Save them into tokens.css.

const ROOT = document.documentElement;
const STORE = "dm:overrides";
const LOGO_STORE = "dm:logo";
const OPEN_STORE = "dm:open";
const IN_FRAME = new URLSearchParams(location.search).has("dm-frame");

const FALLBACK = {
  display: "Impact, sans-serif",
  sans: '"Helvetica Neue", Arial, sans-serif',
  serif: "Georgia, serif",
  mono: "ui-monospace, Menlo, monospace",
};
const stackFor = (family, role) => `"${family}", ${FALLBACK[role] ?? "sans-serif"}`;
const SYSTEM_FONTS = [
  ['Impact, "Arial Narrow Bold", sans-serif', "Impact"],
  ['"Helvetica Neue", Helvetica, Arial, sans-serif', "Helvetica"],
  ['Georgia, "Times New Roman", serif', "Georgia"],
  ["ui-monospace, Menlo, monospace", "System mono"],
  ["system-ui, sans-serif", "System UI"],
];
// Filled from src/dev/fonts/manifest.json (run `mise run fonts`).
let LAB = [];
// Families declared in src/styles/fonts.css, i.e. shipped with the site.
let SITE_FONTS = new Set();

// Any open font on Fontsource (~2,000), loaded from their CDN on demand. Dev only.
const FS_ROLE = { display: "display", handwriting: "display", "sans-serif": "sans", serif: "serif", monospace: "mono" };
let fontsource = null;
async function fontsourceCatalog() {
  if (fontsource) return fontsource;
  const res = await fetch("https://api.fontsource.org/v1/fonts");
  fontsource = (await res.json()).filter(
    (f) => f.subsets.includes("latin") && f.category !== "icons" && f.styles.includes("normal"),
  );
  return fontsource;
}
function loadFontsource(f) {
  const weights = [300, 400, 700, 900].filter((w) => f.weights.includes(w));
  if (!weights.length) weights.push(f.weights[0]);
  const css = weights
    .map(
      (w) =>
        `@font-face{font-family:"${f.family}";src:url(https://cdn.jsdelivr.net/fontsource/fonts/${f.id}@latest/latin-${w}-normal.woff2);font-weight:${w};font-display:swap}`,
    )
    .join("\n");
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  return stackFor(f.family, FS_ROLE[f.category] ?? "sans");
}

async function loadLab() {
  try {
    const css = (await import("/src/styles/fonts.css?raw")).default;
    SITE_FONTS = new Set([...css.matchAll(/font-family:\s*["']?([^"';]+?)["']?\s*;/g)].map((m) => m[1]));
  } catch {}
  try {
    const res = await fetch("/src/dev/fonts/manifest.json");
    if (!res.ok) return;
    LAB = await res.json();
  } catch {
    return;
  }
  const rules = [];
  for (const f of LAB) {
    if (SITE_FONTS.has(f.family)) continue;
    for (const [w, file] of Object.entries(f.files)) {
      rules.push(
        `@font-face{font-family:"${f.family}";src:url(/src/dev/fonts/${file});font-weight:${w};font-display:swap}`,
      );
    }
  }
  const style = document.createElement("style");
  style.dataset.fontLab = "";
  style.textContent = rules.join("\n");
  document.head.append(style);
}

const SWATCHES = ["#ff5fa2", "#3dff8f", "#6c9cff", "#ff6b2c", "#ffe53b", "#c9a7ff", "#ff3b30", "#ffffff"];

// What the panel controls. Every name must exist in tokens.css.
const CONTROLS = [
  [
    "Color",
    [
      { name: "--bg", type: "color", label: "Background" },
      { name: "--fg", type: "color", label: "Text and lines" },
      { type: "reading-presets", label: "Reading pages" },
      { name: "--read-bg", type: "color", label: "Reading bg" },
      { name: "--read-fg", type: "color", label: "Reading text" },
    ],
  ],
  [
    "Logo",
    [
      { type: "logo-text", label: "Word" },
      { name: "--logo-font", type: "font", label: "Font" },
      { name: "--logo-weight", type: "weight", font: "--logo-font", label: "Weight" },
      {
        name: "--logo-scale",
        type: "range",
        label: "Size",
        min: 0.1,
        max: 1,
        step: 0.01,
        unit: "",
        hint: "1 = the word fills the column height (desktop) or width (phone).",
      },
      {
        name: "--logo-max",
        type: "range",
        label: "Max width",
        min: 5,
        max: 50,
        step: 1,
        unit: "vw",
        hint: "Desktop only: caps how wide the logo column can get.",
      },
      {
        name: "--logo-tracking",
        type: "range",
        label: "Tracking",
        min: -0.1,
        max: 0.3,
        step: 0.005,
        unit: "em",
        hint: "Letter spacing. The word refits, so wider spacing means smaller letters.",
      },
      {
        name: "--logo-align",
        type: "select",
        label: "Align",
        options: ["flex-end", "center", "flex-start"],
        hint: "Only visible when the logo is shorter than the column.",
      },
      { type: "logo-info", label: "Now" },
    ],
  ],
  [
    "Type",
    [
      { name: "--heading-font", type: "font", label: "Heading font" },
      { name: "--heading-weight", type: "weight", font: "--heading-font", label: "Heading weight" },
      { name: "--body-font", type: "font", label: "Body font" },
      { name: "--mono-font", type: "font", label: "Mono font" },
      {
        name: "--text-size",
        type: "range",
        label: "Text size",
        min: 75,
        max: 150,
        step: 2.5,
        unit: "%",
        hint: "Root size; all type is in rem, so everything scales with it.",
      },
      { name: "--leading", type: "range", label: "Line height", min: 1, max: 2, step: 0.01, unit: "" },
      {
        name: "--content-width",
        type: "range",
        label: "Content width",
        min: 40,
        max: 100,
        step: 1,
        unit: "cqi",
        hint: "Desktop: how much of the space beside the logo the page uses. The rest stays empty.",
      },
      {
        name: "--measure",
        type: "range",
        label: "Measure",
        min: 30,
        max: 100,
        step: 1,
        unit: "ch",
        hint: "Longest line of body text, inside the content width.",
      },
      { name: "--h1-size", type: "range", label: "H1", min: 1.5, max: 6, step: 0.125, unit: "rem" },
      { name: "--h2-size", type: "range", label: "H2", min: 1, max: 4, step: 0.125, unit: "rem" },
      { name: "--h3-size", type: "range", label: "H3", min: 1, max: 2.5, step: 0.0625, unit: "rem" },
      { name: "--small-size", type: "range", label: "Small", min: 0.6, max: 1, step: 0.025, unit: "rem" },
    ],
  ],
  [
    "Space",
    [
      {
        name: "--unit",
        type: "range",
        label: "Drag snap",
        min: 1,
        max: 16,
        step: 1,
        unit: "px",
        hint: "Only affects dragging handles in design mode.",
      },
      { name: "--gutter", type: "range", label: "Gutter", min: 0, max: 96, step: 1, unit: "px" },
      { name: "--row-pad", type: "range", label: "Row padding", min: 0, max: 48, step: 1, unit: "px" },
      { name: "--section-gap", type: "range", label: "Section gap", min: 0, max: 240, step: 1, unit: "px" },
      { name: "--rule", type: "range", label: "Column edge", min: 0, max: 8, step: 1, unit: "px" },
      { name: "--divider", type: "range", label: "Dividers", min: 0, max: 8, step: 1, unit: "px" },
      { name: "--date-col", type: "range", label: "Date column", min: 4, max: 20, step: 0.5, unit: "ch" },
      { name: "--thumb", type: "range", label: "Roll covers", min: 120, max: 600, step: 10, unit: "px" },
      { name: "--photo-gap", type: "range", label: "Photo gap", min: 0, max: 240, step: 4, unit: "px" },
    ],
  ],
];
// Plus the measured logo values, which have no control of their own.
const ALL = [...CONTROLS.flatMap(([, c]) => c).filter((c) => c.name), { name: "--logo-ratio" }, { name: "--logo-cap" }];

// ---------- state ----------

const read = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};
const write = (k, v) => {
  try {
    v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

let overrides = read(STORE, {});
let logoOverride = read(LOGO_STORE, null);
let sync = () => {}; // the panel replaces this; viewport frames only need apply()
const logoEl = () => document.querySelector(".logo");
const savedLogo = logoEl()?.textContent ?? "";

const cssValue = (name) => getComputedStyle(ROOT).getPropertyValue(name).trim();
const value = (name) => overrides[name] ?? cssValue(name);

function apply() {
  for (const c of ALL) ROOT.style.removeProperty(c.name);
  for (const [k, v] of Object.entries(overrides)) ROOT.style.setProperty(k, v);
  const el = logoEl();
  if (el) el.textContent = logoOverride ?? savedLogo;
}

function set(name, v, { refit = true } = {}) {
  overrides[name] = String(v);
  write(STORE, overrides);
  apply();
  if (refit && ["--logo-font", "--logo-tracking", "--logo-weight"].includes(name)) fitLogo();
  sync();
}

apply();
// Other dev pages (the /__fonts specimen) set tokens through this event.
addEventListener("dm:set", (e) => set(e.detail.name, e.detail.value));
addEventListener("storage", (e) => {
  if (e.key === STORE) overrides = read(STORE, {});
  if (e.key === LOGO_STORE) logoOverride = read(LOGO_STORE, null);
  if (e.key === STORE || e.key === LOGO_STORE) {
    apply();
    sync();
  }
});

// Measure the word's advance width in em so the CSS can size it to fill the column.
async function fitLogo() {
  const el = logoEl();
  if (!el) return;
  const family = value("--logo-font");
  await document.fonts.load(`100px ${family}`, el.textContent).catch(() => {});
  const probe = document.createElement("span");
  probe.textContent = el.textContent;
  Object.assign(probe.style, {
    position: "absolute",
    visibility: "hidden",
    whiteSpace: "nowrap",
    left: "-9999px",
    fontFamily: family,
    fontWeight: value("--logo-weight"),
    fontSize: "1000px",
    letterSpacing: value("--logo-tracking"),
    textTransform: "uppercase",
  });
  document.body.append(probe);
  const ratio = probe.getBoundingClientRect().width / 1000;
  probe.remove();
  // Capital height in em, for the Max width cap.
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `${value("--logo-weight")} 1000px ${family}`;
  const cap = ctx.measureText("H").actualBoundingBoxAscent / 1000;
  if (ratio > 0) set("--logo-ratio", ratio.toFixed(3), { refit: false });
  if (cap > 0) set("--logo-cap", cap.toFixed(3), { refit: false });
}

const num = (v) => parseFloat(v);
const firstFamily = (stack) =>
  stack
    .split(",")[0]
    .trim()
    .replace(/^["']|["']$/g, "");
// Weights a font actually has (from loaded @font-face rules). System fonts get the full range.
function weightsFor(stack) {
  const fam = firstFamily(stack);
  const ws = new Set();
  for (const f of document.fonts) {
    if (firstFamily(f.family) !== fam) continue;
    const [lo, hi = lo] = String(f.weight).split(" ").map(Number);
    for (let w = 100; w <= 900; w += 100) if (w >= lo && w <= hi) ws.add(w);
  }
  return ws.size ? [...ws].sort((a, b) => a - b) : [100, 200, 300, 400, 500, 600, 700, 800, 900];
}
const px = (v, el = ROOT) => {
  // Resolve any length (px, ch, vw, em) to px in the context of el.
  const p = document.createElement("div");
  p.style.cssText = `position:absolute;visibility:hidden;width:${v}`;
  el.append(p);
  const w = p.getBoundingClientRect().width;
  p.remove();
  return w;
};

function contrast(a, b) {
  const lum = (hex) => {
    const c = [1, 3, 5]
      .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
const toHex = (v) => {
  if (/^#[0-9a-f]{6}$/i.test(v)) return v.toLowerCase();
  if (/^#[0-9a-f]{3}$/i.test(v))
    return (
      "#" +
      [...v.slice(1)]
        .map((c) => c + c)
        .join("")
        .toLowerCase()
    );
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = v;
  return ctx.fillStyle;
};

// ---------- UI ----------

function boot() {
  const host = document.createElement("div");
  host.id = "design-mode";
  ROOT.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `<style>${PANEL_CSS}</style>
    <div class="layer"></div>
    <datalist id="fontsource-list"></datalist>
    <button class="tab" title="Design mode (D)">D</button>
    <aside class="panel" hidden>
      <header><b>Design mode</b><span><button data-act="side" title="Move panel">⇄</button><button data-act="close" title="Close (D)">×</button></span></header>
      <div class="body"></div>
      <footer>
        <button data-act="save" class="primary">Save to tokens.css</button>
        <button data-act="copy">Copy</button>
        <button data-act="reset">Reset</button>
        <p class="status"></p>
      </footer>
    </aside>
    <div class="frames" hidden><header><b>Viewports</b><button data-act="frames-close">×</button></header><div class="row"></div></div>`;

  const $ = (s) => shadow.querySelector(s);
  const panel = $(".panel"),
    tab = $(".tab"),
    body = $(".body"),
    status = $(".status"),
    layer = $(".layer");
  const say = (t) => {
    status.textContent = t;
  };

  // ----- panel controls -----
  const inputs = new Map();
  for (const [group, controls] of CONTROLS) {
    const sec = document.createElement("section");
    sec.innerHTML = `<h2>${group}</h2>`;
    if (group === "Color") {
      const sw = document.createElement("div");
      sw.className = "swatches";
      for (const c of SWATCHES) {
        const b = document.createElement("button");
        b.style.background = c;
        b.title = c;
        b.onclick = () => {
          set("--bg", c);
          set("--fg", "#000000");
        };
        sw.append(b);
      }
      const swap = document.createElement("button");
      swap.textContent = "Swap";
      swap.onclick = () => {
        const bg = toHex(cssValue("--bg")),
          fg = toHex(cssValue("--fg"));
        set("--bg", fg);
        set("--fg", bg);
      };
      sw.append(swap);
      sec.append(sw);
    }
    for (const c of controls) sec.append(control(c));
    if (group === "Color") {
      const p = document.createElement("p");
      p.className = "contrast";
      sec.append(p);
    }
    body.append(sec);
  }

  const checks = document.createElement("section");
  checks.innerHTML = `<h2>Check</h2>
    <label class="check"><input type="checkbox" data-ov="baseline"> Baseline grid</label>
    <label class="check"><input type="checkbox" data-ov="outline"> Outline boxes</label>
    <label class="check"><input type="checkbox" data-ov="handles" checked> Drag handles on hover</label>
    <button data-act="frames">Phone · Tablet · Desktop</button>
    <button data-act="fonts">Font specimens (/__fonts)</button>
    <p class="hint">Hover a block to see its spacing, then drag the black handles. Hold Alt to drag without snapping to the unit.</p>`;
  body.append(checks);

  function control(c) {
    const row = document.createElement("label");
    row.className = "row";
    row.innerHTML = `<span>${c.label}</span>`;
    let input, out;
    if (c.type === "logo-text") {
      input = document.createElement("input");
      input.oninput = () => {
        logoOverride = input.value || savedLogo;
        write(LOGO_STORE, logoOverride === savedLogo ? null : logoOverride);
        if (logoOverride === savedLogo) logoOverride = null;
        apply();
        fitLogo();
      };
      inputs.set("logo", {
        sync: () => {
          if (shadow.activeElement !== input) input.value = logoEl()?.textContent ?? "";
        },
      });
      row.append(input);
      return row;
    }
    if (c.type === "logo-info") {
      const out = document.createElement("small");
      out.className = "info";
      inputs.set("logo-info", {
        sync: () => {
          const desktop = innerWidth >= 900;
          const g = num(cssValue("--gutter"));
          const fill =
            (((desktop ? innerHeight : innerWidth) - 2 * g) / num(value("--logo-ratio"))) * num(value("--logo-scale"));
          const capped = desktop && px(value("--logo-max")) / num(value("--logo-cap")) < fill;
          out.textContent = `${desktop ? "Desktop" : "Phone/tablet"}: ${capped ? "limited by Max width" : "limited by Size"} · word ${value("--logo-ratio")}em long, caps ${value("--logo-cap")}em tall (measured)`;
        },
      });
      row.append(out);
      return row;
    }
    if (c.type === "weight") {
      input = document.createElement("select");
      input.onchange = () => set(c.name, input.value);
      inputs.set(c.name, {
        el: input,
        sync: () => {
          const ws = weightsFor(value(c.font));
          const cur = num(value(c.name));
          const near = ws.reduce((a, b) => (Math.abs(b - cur) < Math.abs(a - cur) ? b : a));
          input.replaceChildren(
            ...ws.map((w) => new Option(ws.length === 1 ? `${w} (only weight)` : String(w), String(w))),
          );
          input.value = String(near);
          input.disabled = ws.length === 1;
        },
      });
      row.append(input);
      if (c.hint) {
        const h = document.createElement("small");
        h.textContent = c.hint;
        row.append(h);
      }
      return row;
    }
    if (c.type === "reading-presets") {
      const wrap = document.createElement("span");
      wrap.className = "presets";
      for (const [label, bg, fg] of [
        ["Same as main", "var(--bg)", "var(--fg)"],
        ["Paper", "#f3efe6", "#111111"],
        ["White", "#ffffff", "#000000"],
        ["Black", "#000000", "var(--bg)"],
      ]) {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        b.onclick = () => {
          set("--read-bg", bg);
          set("--read-fg", fg);
        };
        wrap.append(b);
      }
      row.append(wrap);
      return row;
    }
    if (c.type === "color") {
      input = document.createElement("input");
      input.type = "color";
      input.oninput = () => set(c.name, input.value);
    } else if (c.type === "range") {
      input = document.createElement("input");
      input.type = "range";
      Object.assign(input, { min: c.min, max: c.max, step: c.step });
      input.oninput = () => set(c.name, input.value + c.unit);
      out = document.createElement("output");
    } else if (c.type === "number") {
      input = document.createElement("input");
      input.type = "number";
      input.step = c.step;
      input.onchange = () => set(c.name, input.value, { refit: false });
    } else {
      input = document.createElement("select");
      if (c.type === "font") fillFonts(input);
      else for (const o of c.options) input.add(new Option(o, o));
      input.onchange = () => set(c.name, input.value);
    }
    row.append(input);
    if (out) row.append(out);
    if (c.type === "font") row.append(fontSearch(c));
    inputs.set(c.name, {
      el: input,
      font: c.type === "font",
      sync: () => {
        const v = value(c.name);
        if (c.type === "color") input.value = toHex(cssValue(c.name));
        else if (c.type === "range") {
          input.value = num(v);
          out.value = v;
        } else if (c.type === "number") {
          if (shadow.activeElement !== input) input.value = num(v);
        } else syncSelect(input, v);
      },
    });
    if (c.hint) {
      const h = document.createElement("small");
      h.textContent = c.hint;
      row.append(h);
    }
    return row;
  }

  function fontSearch(c) {
    const search = document.createElement("input");
    search.type = "search";
    search.placeholder = "Search ~2,000 open fonts…";
    search.setAttribute("list", "fontsource-list");
    search.onfocus = async () => {
      if ($("#fontsource-list").options.length) return;
      const list = await fontsourceCatalog().catch(() => []);
      $("#fontsource-list").append(...list.map((f) => new Option(`${f.category} · ${f.license}`, f.family)));
    };
    search.onchange = async () => {
      const f = (await fontsourceCatalog()).find((x) => x.family === search.value);
      if (!f) return;
      const v = loadFontsource(f);
      for (const [, i] of inputs)
        if (i.font && ![...i.el.options].some((o) => o.value === v)) i.el.add(new Option(f.family, v));
      set(c.name, v);
      say(`${f.family} (${f.license}) loaded from Fontsource. Save ships it with its license.`);
      search.value = "";
    };
    return search;
  }

  function fillFonts(sel) {
    const group = (label, opts) => {
      const g = document.createElement("optgroup");
      g.label = label;
      for (const [v, text] of opts) g.append(new Option(text, v));
      sel.append(g);
    };
    const roleOf = (fam) => LAB.find((f) => f.family === fam)?.role ?? "sans";
    group(
      "On the site",
      [...SITE_FONTS].map((fam) => [stackFor(fam, roleOf(fam)), fam]),
    );
    for (const [role, label] of [
      ["display", "Display / logo"],
      ["sans", "Sans"],
      ["serif", "Serif"],
      ["mono", "Mono"],
    ]) {
      const fonts = LAB.filter((f) => !SITE_FONTS.has(f.family) && f.role === role);
      if (fonts.length)
        group(
          label,
          fonts.map((f) => [stackFor(f.family, f.role), f.family]),
        );
    }
    group("System", SYSTEM_FONTS);
    if (!LAB.length) group("Font lab missing: run mise run fonts", []);
  }

  function syncSelect(sel, v) {
    const norm = (s) => s.replace(/\s+/g, " ").trim();
    let opt = [...sel.options].find((o) => norm(o.value) === norm(v));
    if (!opt) {
      opt = new Option(`${v.split(",")[0].replace(/"/g, "")} (current)`, v);
      sel.add(opt);
    }
    sel.value = opt.value;
  }

  sync = () => {
    for (const [, i] of inputs) i.sync();
    const grade = (c) => `${c.toFixed(2)}:1 ${c >= 7 ? "AAA" : c >= 4.5 ? "AA" : c >= 3 ? "large text only" : "fails"}`;
    const main = contrast(toHex(cssValue("--bg")), toHex(cssValue("--fg")));
    const reading = contrast(toHex(cssValue("--read-bg")), toHex(cssValue("--read-fg")));
    $(".contrast").innerHTML =
      `Contrast, main: ${grade(main)}<br>Contrast, reading: ${grade(reading)}<br><small>AA needs 4.5:1 for body text, AAA needs 7:1.</small>`;
    const n = Object.keys(overrides).length + (logoOverride != null ? 1 : 0);
    $('[data-act="save"]').disabled = !n;
    if (n) say(`${n} unsaved change${n > 1 ? "s" : ""}. Kept across reloads until you Save or Reset.`);
    else if (!status.textContent.startsWith("Saved")) say("No unsaved changes.");
    drawOverlays();
    if (hovered && !dragging) drawHover();
  };

  // ----- open / close -----
  const setOpen = (open) => {
    panel.hidden = !open;
    tab.hidden = open;
    layer.hidden = !open;
    try {
      sessionStorage.setItem(OPEN_STORE, open ? "1" : "");
    } catch {}
    if (open) sync();
    else drawOverlays();
  };
  tab.onclick = () => setOpen(true);
  addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "d" || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.composedPath()[0];
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    setOpen(panel.hidden);
  });

  // ----- actions -----
  shadow.addEventListener("click", async (e) => {
    const act = e.target.closest?.("[data-act]")?.dataset.act;
    if (!act) return;
    if (act === "close") setOpen(false);
    if (act === "side") panel.classList.toggle("left");
    if (act === "reset") {
      overrides = {};
      logoOverride = null;
      write(STORE, null);
      write(LOGO_STORE, null);
      apply();
      say("Reset to tokens.css.");
      sync();
    }
    if (act === "copy") {
      const lines = ALL.map((c) => `  ${c.name}: ${value(c.name)};`).join("\n");
      await navigator.clipboard.writeText(`:root {\n${lines}\n}`).catch(() => {});
      say("Copied all tokens.");
    }
    if (act === "save") {
      const payload = { vars: overrides };
      if (logoOverride != null) payload.logo = logoOverride;
      const res = await fetch("/__design/save", { method: "POST", body: JSON.stringify(payload) });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) return say(`Save failed: ${out.error ?? res.status}`);
      say(`Saved ${out.changed.join(", ")}. See git diff.`);
      // Vite hot-swaps tokens.css; drop the inline overrides once it has.
      setTimeout(() => {
        overrides = {};
        logoOverride = null;
        write(STORE, null);
        write(LOGO_STORE, null);
        apply();
        sync();
      }, 400);
    }
    if (act === "frames") openFrames();
    if (act === "fonts") location.href = "/__fonts";
    if (act === "frames-close") $(".frames").hidden = true;
  });

  // ----- overlays -----
  const toggles = () =>
    Object.fromEntries([...shadow.querySelectorAll("[data-ov]")].map((i) => [i.dataset.ov, i.checked]));
  for (const i of shadow.querySelectorAll("[data-ov]")) i.onchange = () => sync();
  const outlineStyle = document.createElement("style");
  document.head.append(outlineStyle);

  function drawOverlays() {
    const t = toggles();
    outlineStyle.textContent =
      t.outline && !panel.hidden
        ? `body *{outline:1px dashed color-mix(in srgb, ${value("--fg")} 45%, transparent);outline-offset:-1px}`
        : "";
    const line = num(getComputedStyle(document.body).fontSize) * num(value("--leading"));
    layer.style.setProperty("--baseline", `${line}px`);
    layer.classList.toggle("baseline", t.baseline);
    if (!t.handles) clearHover();
  }

  // ----- direct manipulation -----
  // Elements opt in with data-dm="logo pad:--gutter gap:--section-gap width:--measure rowpad:--row-pad"
  const box = document.createElement("div");
  box.className = "hover";
  box.hidden = true;
  layer.append(box);
  let hovered = null,
    dragging = null;

  function clearHover() {
    hovered = null;
    box.hidden = true;
  }

  addEventListener(
    "pointermove",
    (e) => {
      if (panel.hidden || dragging || !toggles().handles) return;
      if (e.composedPath().includes(host)) return;
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-dm]") ?? null;
      if (el !== hovered) {
        hovered = el;
        drawHover();
      }
    },
    { passive: true },
  );
  addEventListener("scroll", () => hovered && drawHover(), { passive: true });
  addEventListener("resize", () => {
    if (hovered) drawHover();
    drawOverlays();
  });

  const specs = (el) =>
    el.dataset.dm.split(/\s+/).map((s) => {
      const [kind, token] = s.split(":");
      return { kind, token };
    });

  function drawHover() {
    box.replaceChildren();
    if (!hovered) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    const r = hovered.getBoundingClientRect();
    const cs = getComputedStyle(hovered);
    const P = { t: num(cs.paddingTop), r: num(cs.paddingRight), b: num(cs.paddingBottom), l: num(cs.paddingLeft) };
    Object.assign(box.style, {
      left: `${r.left}px`,
      top: `${r.top}px`,
      width: `${r.width}px`,
      height: `${r.height}px`,
    });
    const shade = (cls, s) => {
      const d = document.createElement("i");
      d.className = cls;
      Object.assign(d.style, s);
      box.append(d);
    };
    shade("pad t", { height: `${P.t}px` });
    shade("pad b", { height: `${P.b}px` });
    shade("pad l", { width: `${P.l}px`, top: `${P.t}px`, bottom: `${P.b}px` });
    shade("pad r", { width: `${P.r}px`, top: `${P.t}px`, bottom: `${P.b}px` });
    const mt = num(cs.marginTop);
    if (mt) shade("margin", { height: `${mt}px` });

    const labels = [];
    for (const { kind, token } of specs(hovered)) {
      const h = document.createElement("b");
      h.className = `handle ${kind}`;
      if (kind === "pad") {
        h.style.left = `${P.l - 4}px`;
        labels.push(`padding ${P.l}px ${token}`);
      }
      if (kind === "rowpad") labels.push(`rows ${value(token)} ${token} (drag bottom)`);
      if (kind === "gap") {
        h.style.top = `${-mt - 4}px`;
        labels.push(`gap ${mt}px ${token}`);
      }
      if (kind === "width") {
        h.style.left = `${Math.min(r.width, P.l + px(value(token), hovered)) - 4}px`;
        labels.push(`measure ${value(token)} ${token}`);
      }
      if (kind === "logo") labels.push(`logo fill ${value("--logo-scale")} (drag edge)`);
      h.onpointerdown = (ev) => startDrag(ev, hovered, kind, token);
      box.append(h);
    }
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = labels.join("  ·  ");
    box.append(tag);
  }

  function startDrag(e, el, kind, token) {
    e.preventDefault();
    e.stopPropagation();
    const desktop = matchMedia("(min-width: 900px)").matches;
    const r = el.getBoundingClientRect();
    const start = {
      x: e.clientX,
      y: e.clientY,
      v: token ? num(value(token)) : 0,
      scale: num(value("--logo-scale")),
      size: desktop ? r.width : r.height,
      chPx: kind === "width" ? px("1ch", el) : 1,
    };
    dragging = { el, kind, token };
    const move = (ev) => {
      const dx = ev.clientX - start.x,
        dy = ev.clientY - start.y;
      const unit = num(value("--unit")) || 1;
      const snap = (v) => (ev.altKey ? Math.round(v) : Math.round(v / unit) * unit);
      if (kind === "pad") set(token, `${Math.max(0, snap(start.v + dx))}px`);
      if (kind === "rowpad") set(token, `${Math.max(0, snap(start.v + dy / 2))}px`);
      if (kind === "gap") set(token, `${Math.max(0, snap(start.v - dy))}px`);
      if (kind === "width") set(token, `${Math.max(10, Math.round(start.v + dx / start.chPx))}ch`);
      if (kind === "logo") {
        const delta = desktop ? dx : dy;
        set("--logo-scale", Math.max(0.05, (start.scale * (start.size + delta)) / start.size).toFixed(3));
      }
      drawHover();
    };
    const up = () => {
      dragging = null;
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
  }

  // ----- viewport frames -----
  function openFrames() {
    const wrap = $(".frames"),
      row = $(".frames .row");
    wrap.hidden = false;
    row.replaceChildren();
    const sizes = [
      ["Phone", 390],
      ["Tablet", 820],
      ["Desktop", 1440],
    ];
    const total = sizes.reduce((a, [, w]) => a + w, 0);
    const scale = Math.min(1, (innerWidth - 32 - 16 * (sizes.length - 1)) / total);
    const h = (innerHeight - 90) / scale;
    for (const [name, w] of sizes) {
      const fig = document.createElement("figure");
      fig.style.width = `${w * scale}px`;
      fig.innerHTML = `<figcaption>${name} · ${w}px</figcaption>`;
      const f = document.createElement("iframe");
      const url = new URL(location.href);
      url.searchParams.set("dm-frame", "");
      f.src = url;
      Object.assign(f.style, { width: `${w}px`, height: `${h}px`, transform: `scale(${scale})` });
      const clip = document.createElement("div");
      clip.className = "clip";
      clip.style.height = `${h * scale}px`;
      clip.append(f);
      fig.append(clip);
      row.append(fig);
    }
  }

  let open = false;
  try {
    open = !!sessionStorage.getItem(OPEN_STORE);
  } catch {}
  setOpen(open);
  document.fonts?.ready.then(() => sync());
}

const PANEL_CSS = `
:host { all: initial; }
* { box-sizing: border-box; }
button, input, select { font: inherit; color: inherit; }
.tab, .panel, .frames { font: 13px/1.35 system-ui, sans-serif; color: #000; }
.tab { position: fixed; right: 12px; bottom: 12px; z-index: 2147483646; width: 36px; height: 36px; border: 2px solid #000; background: #fff; cursor: pointer; font-weight: 700; }
[hidden] { display: none !important; }
.panel { position: fixed; top: 0; right: 0; z-index: 2147483646; width: 320px; height: 100dvh; display: flex; flex-direction: column; background: #fff; border-left: 2px solid #000; }
.panel.left { right: auto; left: 0; border-left: 0; border-right: 2px solid #000; }
.panel header, .frames header { display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: #000; color: #fff; }
.panel header button, .frames header button { border: 1px solid #fff; background: #000; color: #fff; padding: 2px 8px; margin-left: 4px; cursor: pointer; }
.body { flex: 1; overflow: auto; }
section { padding: 10px 12px; border-bottom: 1px solid #ccc; }
h2 { margin: 0 0 8px; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
.row { display: grid; grid-template-columns: 84px 1fr 56px; gap: 6px; align-items: center; margin: 5px 0; }
.row > select, .row > input:not([type]), .row > input[type=number], .row > input[type=color] { grid-column: 2 / 4; width: 100%; }
.row > input[type=search] { grid-column: 2 / 4; width: 100%; border: 1px solid #000; padding: 4px 6px; border-radius: 0; font-size: 12px; }
.row small { grid-column: 1 / 4; color: #666; font-size: 11px; }
.row output { font: 11px ui-monospace, Menlo, monospace; text-align: right; color: #444; }
input[type=range] { width: 100%; accent-color: #000; }
input:not([type]), input[type=number], select { border: 1px solid #000; padding: 4px 6px; background: #fff; border-radius: 0; }
input[type=color] { height: 28px; padding: 0; border: 1px solid #000; background: #fff; }
.swatches { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 6px; }
.swatches button { width: 26px; height: 26px; border: 2px solid #000; cursor: pointer; padding: 0; }
.swatches button:last-child { width: auto; padding: 0 8px; background: #fff; }
.contrast { margin: 6px 0 0; font-weight: 600; }
.contrast small { font-weight: 400; color: #666; }
.row > select:disabled { opacity: .6; }
.row .info { grid-column: 2 / 4 !important; }
.presets { grid-column: 2 / 4; display: flex; flex-wrap: wrap; gap: 4px; }
.presets button { border: 1px solid #000; background: #fff; padding: 2px 6px; font-size: 11px; cursor: pointer; }
.check { display: flex; gap: 6px; align-items: center; margin: 4px 0; }
section > button, footer button { border: 2px solid #000; background: #fff; padding: 6px 10px; cursor: pointer; }
section > button { margin-top: 6px; width: 100%; }
.hint { color: #666; font-size: 11px; margin: 6px 0 0; }
footer { padding: 10px 12px; border-top: 2px solid #000; display: flex; flex-wrap: wrap; gap: 6px; }
footer .primary { background: #000; color: #fff; flex: 1; }
footer button:disabled { opacity: .4; cursor: default; }
.status { flex-basis: 100%; margin: 4px 0 0; font-size: 11px; color: #444; min-height: 1.3em; }

.layer { position: fixed; inset: 0; z-index: 2147483645; pointer-events: none; }
.layer.baseline { background: repeating-linear-gradient(to bottom, transparent 0 calc(var(--baseline) - 1px), rgba(0, 160, 255, .5) calc(var(--baseline) - 1px) var(--baseline)); }
.hover { position: fixed; outline: 1px solid #0af; }
.hover .pad { position: absolute; background: rgba(0, 170, 255, .2); }
.hover .pad.t { top: 0; left: 0; right: 0; } .hover .pad.b { bottom: 0; left: 0; right: 0; }
.hover .pad.l { left: 0; } .hover .pad.r { right: 0; }
.hover .margin { position: absolute; bottom: 100%; left: 0; right: 0; background: rgba(255, 170, 0, .35); }
.handle { position: absolute; pointer-events: auto; background: #000; border: 2px solid #fff; }
.handle.pad, .handle.width { top: 0; bottom: 0; width: 8px; cursor: ew-resize; }
.handle.rowpad { left: 0; right: 0; bottom: -4px; height: 8px; cursor: ns-resize; }
.handle.gap { left: 0; right: 0; height: 8px; cursor: ns-resize; }
.handle.logo { top: 0; bottom: 0; right: -4px; width: 8px; cursor: ew-resize; }
@media (max-width: 899px) { .handle.logo { top: auto; bottom: -4px; left: 0; right: 0; width: auto; height: 8px; cursor: ns-resize; } }
.tag { position: absolute; left: 0; top: 0; transform: translateY(-100%); background: #0af; color: #000; font: 11px ui-monospace, Menlo, monospace; padding: 2px 6px; white-space: nowrap; }

.frames { position: fixed; inset: 0; z-index: 2147483647; background: #e8e8e8; display: flex; flex-direction: column; }
.frames .row { display: flex; gap: 16px; padding: 16px; align-items: flex-start; margin: 0; overflow: auto; }
figure { margin: 0; flex: none; }
figcaption { font-size: 11px; margin-bottom: 4px; }
.clip { overflow: hidden; border: 1px solid #000; background: #fff; }
iframe { border: 0; transform-origin: 0 0; display: block; }
`;

loadLab().then(() => {
  if (!IN_FRAME) boot();
});
