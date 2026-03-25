# Ho Chi Minh Photo Gallery

This project uses static export with build-time image manifest generation from local files, so it can be deployed to Cloudflare Pages.

## Architecture

- Next.js static export (output in out/)
- Build-time page data from public/photos-manifest.json
- Build-time manifest generation from local files in public/photo (scripts/generate-photos-manifest.mjs)

At runtime, Cloudflare only serves static files. No Next.js server is required.

## Local development

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Build static output:

```bash
npm run build
```

## Image source

Put your images in public/photo.

- Supported extensions: .png, .jpg, .jpeg, .webp, .avif
- Manifest file public/photos-manifest.json is generated automatically on npm run build

## Cloudflare Pages deployment

Use these settings in Cloudflare Pages:

- Framework preset: Next.js (or None)
- Build command: npm run build
- Build output directory: out
- Node.js version: 20+

Because this project exports static files, Cloudflare Pages can serve it directly from out/.
