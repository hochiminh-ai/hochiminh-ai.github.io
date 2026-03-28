import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const publicDir = path.join(process.cwd(), "public");
const manifestPath = path.join(publicDir, "photos-manifest.json");
const sitemapPath = path.join(publicDir, "sitemap.xml");
const mediaSitemapPath = path.join(publicDir, "sitemap-media.xml");
const sitemapIndexPath = path.join(publicDir, "sitemap-index.xml");
const robotsPath = path.join(publicDir, "robots.txt");
const siteUrl = (process.env.SITE_URL || "https://hochiminh-ai.pages.dev").replace(/\/$/, "");

const photoLabelStart = 100;

/** @typedef {{ id?: number; src?: string }} ManifestImage */

/**
 * @param {string} value
 */
function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/**
 * @param {string} pathname
 */
function toAbsoluteUrl(pathname) {
  if (!pathname.startsWith("/")) {
    return `${siteUrl}/${pathname}`;
  }
  return `${siteUrl}${pathname}`;
}

/**
 * @param {string} url
 */
function buildPageUrlEntry(url) {
  return ["  <url>", `    <loc>${escapeXml(url)}</loc>`, "  </url>"].join("\n");
}

/**
 * @param {number} photoId
 */
function buildPhotoMeta(photoId) {
  const photoLabel = photoLabelStart + photoId;
  return {
    title: `Hồ Chí Minh - AI Restored Photo - #${photoLabel}`,
    caption: `Ảnh lịch sử được phục chế bằng AI - #${photoLabel}`,
    geo: "Vietnam",
  };
}

/**
 * @param {string} pageUrl
 * @param {string} imageUrl
 * @param {{ title: string; caption: string; geo: string }} meta
 */
function buildImageUrlEntry(pageUrl, imageUrl, meta) {
  return [
    "  <url>",
    `    <loc>${escapeXml(pageUrl)}</loc>`,
    "    <image:image>",
    `      <image:loc>${escapeXml(imageUrl)}</image:loc>`,
    `      <image:title>${escapeXml(meta.title)}</image:title>`,
    `      <image:caption>${escapeXml(meta.caption)}</image:caption>`,
    `      <image:geo_location>${escapeXml(meta.geo)}</image:geo_location>`,
    "    </image:image>",
    "  </url>",
  ].join("\n");
}

/**
 * @param {string[]} entries
 * @param {{ includeImageNamespace?: boolean }} [options]
 */
function buildSitemapXml(entries, options = {}) {
  const imageNamespace = options.includeImageNamespace
    ? ' xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'
    : "";

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${imageNamespace}>`,
    ...entries,
    "</urlset>",
    "",
  ].join("\n");
}

/**
 * @param {string[]} sitemapUrls
 */
function buildSitemapIndexXml(sitemapUrls) {
  const entries = sitemapUrls.map((url) => {
    return ["  <sitemap>", `    <loc>${escapeXml(url)}</loc>`, "  </sitemap>"].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</sitemapindex>",
    "",
  ].join("\n");
}

/**
 * @param {string[]} sitemapUrls
 */
function buildRobotsTxt(sitemapUrls) {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    ...sitemapUrls.map((url) => `Sitemap: ${url}`),
    "",
  ].join("\n");
}

async function readManifest() {
  try {
    const fileContent = await readFile(manifestPath, "utf8");
    /** @type {unknown} */
    const parsed = JSON.parse(fileContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function main() {
  /** @type {ManifestImage[]} */
  const images = await readManifest();

  const staticUrls = [
    toAbsoluteUrl("/"),
    toAbsoluteUrl("/hochiminh/"),
    toAbsoluteUrl("/compare/"),
  ];

  const pageEntries = [];
  const mediaEntries = [];

  for (const staticUrl of staticUrls) {
    pageEntries.push(buildPageUrlEntry(staticUrl));
  }

  for (const image of images) {
    const src = typeof image.src === "string" ? image.src : "";
    if (!src) {
      continue;
    }

    const imageUrl = toAbsoluteUrl(src);
    const photoId = Number.isInteger(image.id) ? image.id : null;

    if (photoId !== null) {
      const pageUrl = toAbsoluteUrl(`/p/${photoId}/`);
      const photoMeta = buildPhotoMeta(photoId);
      pageEntries.push(buildPageUrlEntry(pageUrl));
      mediaEntries.push(buildImageUrlEntry(pageUrl, imageUrl, photoMeta));
    }
  }

  if (images.length > 0) {
    const representativeSrc = typeof images[0]?.src === "string" ? images[0].src : "";
    if (representativeSrc) {
      const representativeImageUrl = toAbsoluteUrl(representativeSrc);
      for (const staticUrl of staticUrls) {
        mediaEntries.push(
          buildImageUrlEntry(staticUrl, representativeImageUrl, {
            title: "Hồ Chí Minh - AI Restored Photo Gallery",
            caption: "Bộ sưu tập ảnh lịch sử được phục chế bằng AI",
            geo: "Vietnam",
          }),
        );
      }
    }
  }

  const pageSitemapXml = buildSitemapXml(pageEntries);
  const mediaSitemapXml = buildSitemapXml(mediaEntries, { includeImageNamespace: true });
  const sitemapUrls = [
    toAbsoluteUrl("/sitemap.xml"),
    toAbsoluteUrl("/sitemap-media.xml"),
  ];
  const sitemapIndexXml = buildSitemapIndexXml(sitemapUrls);
  const robotsTxt = buildRobotsTxt([toAbsoluteUrl("/sitemap-index.xml"), ...sitemapUrls]);

  await mkdir(path.dirname(sitemapPath), { recursive: true });
  await Promise.all([
    writeFile(sitemapPath, pageSitemapXml, "utf8"),
    writeFile(mediaSitemapPath, mediaSitemapXml, "utf8"),
    writeFile(sitemapIndexPath, sitemapIndexXml, "utf8"),
    writeFile(robotsPath, robotsTxt, "utf8"),
  ]);

  console.log(`Wrote page sitemap with ${pageEntries.length} URL entries to ${sitemapPath}`);
  console.log(
    `Wrote media sitemap with ${mediaEntries.length} URL entries to ${mediaSitemapPath}`,
  );
  console.log(`Wrote sitemap index to ${sitemapIndexPath}`);
  console.log(`Wrote robots.txt to ${robotsPath}`);
}

main().catch(async (error) => {
  console.error("Failed to generate sitemap:", error);

  const fallbackPageXml = buildSitemapXml([buildPageUrlEntry(toAbsoluteUrl("/"))]);
  const fallbackMediaXml = buildSitemapXml([], { includeImageNamespace: true });
  const fallbackSitemapUrls = [
    toAbsoluteUrl("/sitemap.xml"),
    toAbsoluteUrl("/sitemap-media.xml"),
  ];
  const fallbackSitemapIndexXml = buildSitemapIndexXml(fallbackSitemapUrls);
  const fallbackRobotsTxt = buildRobotsTxt([
    toAbsoluteUrl("/sitemap-index.xml"),
    ...fallbackSitemapUrls,
  ]);

  await mkdir(path.dirname(sitemapPath), { recursive: true });
  await Promise.all([
    writeFile(sitemapPath, fallbackPageXml, "utf8"),
    writeFile(mediaSitemapPath, fallbackMediaXml, "utf8"),
    writeFile(sitemapIndexPath, fallbackSitemapIndexXml, "utf8"),
    writeFile(robotsPath, fallbackRobotsTxt, "utf8"),
  ]);
  process.exitCode = 1;
});
