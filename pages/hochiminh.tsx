import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { readPhotosManifest } from "../utils/photosManifest";
import type { ImageProps } from "../utils/types";

type HoChiMinhPageProps = {
  images: ImageProps[];
};

const HoChiMinhPage: NextPage<HoChiMinhPageProps> = ({ images }) => {
  return (
    <>
      <Head>
        <title>Ho Chi Minh Photo Stack</title>
      </Head>

      <main className="mx-auto min-h-screen w-full max-w-5xl p-4 sm:p-6">
        <section className="mb-6 rounded-2xl border border-white/15 bg-white/10 p-5 text-white shadow-highlight sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-bold tracking-wide sm:text-2xl">Ho Chi Minh Photo Stack</h1>
            <Link
              href="/"
              className="rounded-lg border border-white/60 px-3 py-2 text-sm font-semibold transition hover:bg-white hover:text-black"
            >
              Back to Album
            </Link>
          </div>
          <p className="mt-2 text-sm text-white/75">
            All photos are displayed one by one in a vertical stack. Total: {images.length} images.
          </p>
        </section>

        {images.length === 0 ? (
          <div className="rounded-xl border border-white/15 bg-white/5 p-6 text-center text-white/70">
            No images found in /public/photo/colorize.
          </div>
        ) : (
          <section className="space-y-5">
            {images.map((image, index) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-2xl border border-white/15 bg-black/25 shadow-highlight"
              >
                <div className="relative w-full">
                  <Image
                    src={image.src}
                    alt={`Ho Chi Minh photo ${index + 1}`}
                    width={image.width}
                    height={image.height}
                    priority={index === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 90vw, 1100px"
                    className="h-auto w-full object-contain"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 bg-black/30 px-4 py-3 text-sm text-white/85">
                  <span>Photo {index + 1}</span>
                  <span className="truncate text-white/65">{image.name}</span>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
};

export default HoChiMinhPage;

export const getStaticProps: GetStaticProps<HoChiMinhPageProps> = async () => {
  const images = await readPhotosManifest();

  return {
    props: {
      images,
    },
  };
};
