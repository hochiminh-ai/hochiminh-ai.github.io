// @ts-nocheck
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const outputPath = path.join(process.cwd(), "public", "photos-manifest.json");
const photosDir = path.join(process.cwd(), "public", "photo", "colorize");
const supportedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

async function writeManifest(images) {
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(images, null, 2), "utf8");
  console.log(`Wrote ${images.length} photos to ${outputPath}`);
}

async function main() {
  let entries;
  try {
    entries = await readdir(photosDir, { withFileTypes: true });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      await writeManifest([]);
      return;
    }
    throw error;
  }

  const imageFiles = entries
    .filter(
      (entry) =>
        entry.isFile() &&
        supportedExtensions.has(path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => path.join(photosDir, entry.name))
    .sort((a, b) => a.localeCompare(b));

  const manifest = imageFiles.map((filePath, id) => {
    const relativePath = path.relative(path.join(process.cwd(), "public"), filePath);
    return {
      id,
      name: path.basename(filePath),
      src: `/${relativePath.split(path.sep).join("/")}`,
      width: 0,
      height: 0,
    };
  });

  await writeManifest(manifest);
}

main().catch(async (error) => {
  console.error("Failed to generate photos manifest:", error);
  await writeManifest([]);
  process.exitCode = 1;
});
