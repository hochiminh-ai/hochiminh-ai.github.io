import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ImageProps } from "./types";

const manifestPath = path.join(process.cwd(), "public", "photos-manifest.json");

export async function readPhotosManifest(): Promise<ImageProps[]> {
  try {
    const fileContent = await readFile(manifestPath, "utf8");
    const parsed = JSON.parse(fileContent) as ImageProps[];
    return parsed.map((item, id) => ({ ...item, id }));
  } catch {
    return [];
  }
}
