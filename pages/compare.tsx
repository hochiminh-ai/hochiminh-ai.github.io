import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import Zoom from "react-medium-image-zoom";
import ImageCompareSlider from "../components/ImageCompareSlider";

const ComparePage: NextPage = () => {
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

          <ImageCompareSlider
            beforeImageSrc="/photo/Image_v5wppev5wppev5wp_blackwhite.png"
            afterImageSrc="/photo/Image_9meq1f9meq1f9meq_colorized.png"
            beforeLabel="Black & White"
            afterLabel="Colorized"
          />

          <section className="mt-8 border-t border-white/15 pt-6">
            <h2 className="mb-3 text-lg font-semibold text-white">Black & White Viewer</h2>
            <p className="mb-4 text-sm text-white/70">Click the image to zoom in full detail.</p>
            <div className="mx-auto w-fit max-w-full overflow-hidden rounded-2xl border border-white/20 bg-black/30 shadow-highlight">
              <Zoom>
                <Image
                  src="/photo/Image_v5wppev5wppev5wp_blackwhite.png"
                  alt="Black and white Ho Chi Minh portrait"
                  width={1400}
                  height={900}
                  className="h-auto max-h-[75vh] w-auto max-w-full object-contain"
                />
              </Zoom>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default ComparePage;