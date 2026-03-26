import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { GetStaticProps, NextPage } from "next";
import { access } from "node:fs/promises";
import path from "node:path";
import { useMemo, useState } from "react";
import Zoom from "react-medium-image-zoom";
import ImageCompareSlider from "../components/ImageCompareSlider";
import { readPhotosManifest } from "../utils/photosManifest";

type ComparePair = {
  fileName: string;
  beforeImageSrc: string;
  afterImageSrc: string;
};

type ComparePageProps = {
  comparePairs: ComparePair[];
};

const ComparePage: NextPage<ComparePageProps> = ({ comparePairs }) => {
  const [selectedFileName, setSelectedFileName] = useState(
    comparePairs[0]?.fileName ?? "",
  );

  const selectedPair = useMemo(
    () =>
      comparePairs.find((pair) => pair.fileName === selectedFileName) ??
      comparePairs[0] ??
      null,
    [comparePairs, selectedFileName],
  );

  return (
    <>
      <Head>
        <title>Black & White vs Colorized | Ho Chi Minh AI Gallery</title>
      </Head>

      <main className="mx-auto min-h-screen w-full p-4 sm:p-6">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-highlight sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            
            <Link
              href="/"
              className="rounded-lg border border-white/50 px-3 py-2 text-sm font-semibold transition hover:bg-white hover:text-black"
            >
              Back to Gallery
            </Link>
          </div>
          {selectedPair ? (
            <>
              <div className="mb-4">
                <label htmlFor="compare-select" className="mb-2 block text-sm text-white/75">
                  Select image file
                </label>
                <select
                  id="compare-select"
                  value={selectedPair.fileName}
                  onChange={(event) => setSelectedFileName(event.target.value)}
                  className="w-full rounded-lg border border-white/35 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-white"
                >
                  {comparePairs.map((pair) => (
                    <option key={pair.fileName} value={pair.fileName}>
                      {pair.fileName}
                    </option>
                  ))}
                </select>
              </div>

              <ImageCompareSlider
                beforeImageSrc={selectedPair.beforeImageSrc}
                afterImageSrc={selectedPair.afterImageSrc}
                beforeLabel="Black & White"
                afterLabel="Colorized"
              />

              <section className="mt-8 border-t border-white/15 pt-6">
                <h2 className="mb-3 text-lg font-semibold text-white">Black & White Viewer</h2>
                <p className="mb-4 text-sm text-white/70">Click the image to zoom in full detail.</p>
                <div className="mx-auto w-fit max-w-full overflow-hidden rounded-2xl border border-white/20 bg-black/30 shadow-highlight">
                  <Zoom>
                    <Image
                      src={selectedPair.beforeImageSrc}
                      alt={`Black and white Ho Chi Minh portrait (${selectedPair.fileName})`}
                      width={1400}
                      height={900}
                      className="h-auto max-h-[75vh] w-auto max-w-full object-contain"
                    />
                  </Zoom>
                </div>
              </section>
            </>
          ) : (
            <div className="rounded-lg border border-white/15 bg-white/5 p-4 text-white/75">
              No matching image pairs found in /public/photo/old and /public/photo/colorize.
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ComparePage;

export const getStaticProps: GetStaticProps<ComparePageProps> = async () => {
  const colorizedImages = await readPhotosManifest();
  const oldDir = path.join(process.cwd(), "public", "photo", "old");

  const comparePairs = (
    await Promise.all(
      colorizedImages.map(async (image) => {
        const oldFilePath = path.join(oldDir, image.name);
        try {
          await access(oldFilePath);
          return {
            fileName: image.name,
            beforeImageSrc: `/photo/old/${image.name}`,
            afterImageSrc: image.src,
          };
        } catch {
          return null;
        }
      }),
    )
  ).filter((pair): pair is ComparePair => pair !== null);

  return {
    props: {
      comparePairs,
    },
  };
};