// scripts/watch-images.mjs
import chokidar from "chokidar";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.join(__dirname, "..", "public", "images");

// Welche Quell-Formate beobachtet werden sollen
const VALID_EXT = [".png", ".jpg", ".jpeg"];

// Suffixe, die wir für generierte Varianten verwenden
const VARIANT_SUFFIXES = ["@0.75x", "@0.5x", "@0.25x"];

// Skalenfaktoren passend zu den Suffixen
const VARIANTS = [
  { suffix: "", scale: 1 }, // nur für AVIF in Originalgröße
  { suffix: "@0.75x", scale: 0.75 },
  { suffix: "@0.5x", scale: 0.5 },
  { suffix: "@0.25x", scale: 0.25 },
];

function isVariantFilename(basename) {
  return VARIANT_SUFFIXES.some((suf) => basename.endsWith(suf));
}

async function fileIsUpToDate(target, srcMtimeMs) {
  try {
    const stat = await fs.stat(target);
    return stat.mtimeMs >= srcMtimeMs;
  } catch {
    // Datei existiert noch nicht
    return false;
  }
}

async function generateVariantPair({
  srcPath,
  baseName,
  dir,
  ext,
  scale,
  suffix,
  srcMtimeMs,
  width,
  height,
}) {
  // 1. Raster-Format (jpg/png) nur für Varianten mit Suffix
  if (suffix) {
    const rasterTarget = path.join(dir, `${baseName}${suffix}${ext}`);
    if (!(await fileIsUpToDate(rasterTarget, srcMtimeMs))) {
      const img = sharp(srcPath);
      let pipeline = img;

      if (width && height && scale !== 1) {
        pipeline = img.resize({
          width: Math.round(width * scale),
          height: Math.round(height * scale),
        });
      }

      if (ext === ".png") {
        pipeline = pipeline.png({ quality: 90 });
      } else {
        pipeline = pipeline.jpeg({ quality: 90 });
      }

      await pipeline.toFile(rasterTarget);
      console.log("✓ Raster-Variante erstellt:", rasterTarget);
    }
  }

  // 2. AVIF in passender Größe (auch für Original ohne Suffix)
  const avifTarget = path.join(dir, `${baseName}${suffix}.avif`);
  if (!(await fileIsUpToDate(avifTarget, srcMtimeMs))) {
    const img = sharp(srcPath);
    let pipeline = img;

    if (width && height && scale !== 1) {
      pipeline = img.resize({
        width: Math.round(width * scale),
        height: Math.round(height * scale),
      });
    }

    pipeline = pipeline.avif({ quality: 50 });

    await pipeline.toFile(avifTarget);
    console.log("✓ AVIF erstellt:", avifTarget);
  }
}

async function processImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!VALID_EXT.includes(ext)) return;

  const baseName = path.basename(filePath, ext);
  const dir = path.dirname(filePath);

  // Generierte Varianten nicht nochmal anfassen
  if (isVariantFilename(baseName)) {
    return;
  }

  try {
    const srcStat = await fs.stat(filePath);
    const srcMtimeMs = srcStat.mtimeMs;

    // Metadaten einmal holen, um Breite/Höhe zu kennen
    const meta = await sharp(filePath).metadata();
    const width = meta.width;
    const height = meta.height;

    if (!width || !height) {
      console.warn("⚠️ Konnte Breite/Höhe nicht ermitteln:", filePath);
      return;
    }

    for (const variant of VARIANTS) {
      await generateVariantPair({
        srcPath: filePath,
        baseName,
        dir,
        ext,
        scale: variant.scale,
        suffix: variant.suffix,
        srcMtimeMs,
        width,
        height,
      });
    }
  } catch (err) {
    console.error("❌ Fehler beim Verarbeiten von", filePath, err);
  }
}

function startWatcher() {
  console.log("Watching images in:", IMAGES_DIR);

  const watcher = chokidar.watch(IMAGES_DIR, {
    ignoreInitial: false,
    persistent: true,
    awaitWriteFinish: {
      stabilityThreshold: 300,
      pollInterval: 100,
    },
  });

  watcher
    .on("add", (filePath) => {
      console.log("→ Neue Datei:", filePath);
      processImage(filePath);
    })
    .on("change", (filePath) => {
      console.log("→ Geändert:", filePath);
      processImage(filePath);
    });
}

startWatcher();
