// Prepares photos in content/photos/ for the web. Run before committing new photos:
//
//   mise run photos
//
// - converts HEIC/HEIF (via macOS sips) and TIFF to JPEG
// - applies EXIF rotation, shrinks the long edge to 2400px
// - strips ALL metadata, including GPS location
// Files that are already clean and small enough are left alone.
//
//   node src/dev/photos.mjs --check   (CI) only reports, exits 1 if anything needs cleaning
import { execFileSync } from "node:child_process";
import { readdir, rename, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = fileURLToPath(new URL("../../content/photos/", import.meta.url));
const MAX = 2400;
const CHECK = process.argv.includes("--check");
const dirtyFiles = [];

let changed = 0,
  ok = 0;
for (const roll of await readdir(ROOT, { withFileTypes: true })) {
  if (!roll.isDirectory()) continue;
  const dir = join(ROOT, roll.name);
  for (const name of (await readdir(dir)).sort()) {
    let file = join(dir, name);
    const ext = name.split(".").pop().toLowerCase();
    if (CHECK && ["heic", "heif", "tif", "tiff"].includes(ext)) {
      dirtyFiles.push(`${roll.name}/${name}`);
      continue;
    }
    if (["heic", "heif"].includes(ext)) {
      const jpg = file.replace(/\.\w+$/, ".jpg");
      execFileSync("sips", ["-s", "format", "jpeg", file, "--out", jpg], { stdio: "ignore" });
      await rm(file);
      file = jpg;
      console.log(`converted ${roll.name}/${name} -> .jpg`);
    } else if (!["jpg", "jpeg", "png", "webp", "tif", "tiff"].includes(ext)) {
      continue;
    }

    const meta = await sharp(file).metadata();
    const big = Math.max(meta.width, meta.height) > MAX;
    const dirty = meta.exif || meta.xmp || meta.iptc || (meta.orientation && meta.orientation !== 1);
    const tiff = /\.tiff?$/i.test(file);
    if (!big && !dirty && !tiff) {
      ok++;
      continue;
    }
    if (CHECK) {
      dirtyFiles.push(`${roll.name}/${name}`);
      continue;
    }

    const out = tiff ? file.replace(/\.tiff?$/i, ".jpg") : file;
    const img = sharp(file).rotate().resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true });
    const fmt = /\.png$/i.test(out)
      ? img.png()
      : /\.webp$/i.test(out)
        ? img.webp({ quality: 88 })
        : img.jpeg({ quality: 88, mozjpeg: true });
    await fmt.toFile(`${out}.tmp`);
    await rename(`${out}.tmp`, out);
    if (out !== file) await rm(file);
    changed++;
    console.log(`cleaned ${roll.name}/${out.split("/").pop()}${big ? " (resized)" : ""}`);
  }
}
if (CHECK) {
  if (dirtyFiles.length) {
    console.error(
      `These photos still have metadata (maybe GPS) or are too big. Run \`mise run photos\`:\n  ${dirtyFiles.join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log(`${ok} photos clean`);
} else {
  console.log(`${changed} cleaned, ${ok} already fine`);
}
