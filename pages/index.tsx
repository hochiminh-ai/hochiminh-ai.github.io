import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef } from "react";
import Bridge from "../components/Icons/Bridge";
import Logo from "../components/Icons/Logo";
import Modal from "../components/Modal";
import cloudinary from "../utils/cloudinary";
import getBase64ImageUrl from "../utils/generateBlurPlaceholder";
import type { ImageProps } from "../utils/types";
import { useLastViewedPhoto } from "../utils/useLastViewedPhoto";

const Home: NextPage = ({ images }: { images: ImageProps[] }) => {
  const router = useRouter();
  const { photoId } = router.query;
  const [lastViewedPhoto, setLastViewedPhoto] = useLastViewedPhoto();

  const lastViewedPhotoRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // This effect keeps track of the last viewed photo in the modal to keep the index page in sync when the user navigates back
    if (lastViewedPhoto && !photoId) {
      lastViewedPhotoRef.current.scrollIntoView({ block: "center" });
      setLastViewedPhoto(null);
    }
  }, [photoId, lastViewedPhoto, setLastViewedPhoto]);

  return (
    <>
      <Head>
        <title>Tấm gương rạng ngời dân tộc, sự kết hợp giữa khôn khéo chiến lược và đạo đức bền vững qua nhiều thập kỷ thử thách là minh chứng cho tài năng mọi thời đại.</title>
        <meta
          property="og:image"
          content="https://hochiminh-ai.vercel.app/og-image.png"
        />
        <meta
          name="twitter:image"
          content="https://hochiminh-ai.vercel.app/og-image.png"
        />
      </Head>
      <main className="mx-auto max-w-[1960px] p-4">
        {photoId && (
          <Modal
            images={images}
            onClose={() => {
              setLastViewedPhoto(photoId);
            }}
          />
        )}
        <div className="after:content relative w-full mb-5 flex flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-8 pt-40 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-6">
            <div className="flex w-64 max-w-[40ch] items-center justify-center">
              <Logo />
            </div>
            <h1 className="mt-8 text-2xl font-bold tracking-widest">
              Chủ tịch Hồ Chí Minh
            </h1>
            <h3 className="font-semibold">
              AI Enhance Photo Gallery
            </h3>
            <p className="max-w-[60ch] text-white/75 sm:max-w-[40ch]">
              Tấm gương rạng ngời dân tộc, sự kết hợp giữa khôn khéo chiến lược và đạo đức bền vững qua nhiều thập kỷ thử thách là minh chứng cho tài năng mọi thời đại.
            </p>
            {/* <a
              className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-white/10 hover:text-white md:mt-4"
              target="_blank"
              rel="noreferrer"
            >
              Clone and Deploy
            </a> */}
          </div>
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          
          {images.map(({ id, public_id, format, blurDataUrl }) => (
            <Link
              key={id}
              href={`/?photoId=${id}`}
              as={`/p/${id}`}
              ref={id === Number(lastViewedPhoto) ? lastViewedPhotoRef : null}
              shallow
              className="after:content group relative mb-5 block w-full cursor-zoom-in after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight"
            >
              <Image
                alt="Ho Chi Minh AI Image photo"
                className="transform rounded-lg brightness-90 transition will-change-auto group-hover:brightness-110"
                style={{ transform: "translate3d(0, 0, 0)" }}
                placeholder="blur"
                blurDataURL={blurDataUrl}
                src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/c_scale,w_720/${public_id}.${format}`}
                width={720}
                height={480}
                sizes="(max-width: 640px) 100vw,
                  (max-width: 1280px) 50vw,
                  (max-width: 1536px) 33vw,
                  25vw"
              />
            </Link>
          ))}
        </div>
      </main>
      <footer className="p-6 text-center text-white/80 sm:p-12">
        {/* Thank you to{" "} */}
        <a
          href="https://hochiminh-ai.github.io"
          target="_blank"
          className="underline"
          rel="noreferrer"
        >
          hochiminh-ai.github.io
        </a>
        <div className="flex items-center justify-center gap-2">
          <a
            href="https://www.linkedin.com/company/openhuman"
            target="_blank"
            className="font-semibold hover:text-white"
            rel="noreferrer"
          >
            OpenHuman ©
          </a>
          {' '}for the AI photo.
        </div>
      </footer>
    </>
  );
};

export default Home;

export async function getStaticProps() {
  const results = await cloudinary.v2.search
    .expression(`folder:${process.env.CLOUDINARY_FOLDER}/*`)
    .sort_by("public_id", "desc")
    .max_results(400)
    .execute();
  let reducedResults: ImageProps[] = [];

  let i = 0;
  for (let result of results.resources) {
    reducedResults.push({
      id: i,
      height: result.height,
      width: result.width,
      public_id: result.public_id,
      format: result.format,
    });
    i++;
  }

  const blurImagePromises = results.resources.map((image: ImageProps) => {
    return getBase64ImageUrl(image);
  });
  const imagesWithBlurDataUrls = await Promise.all(blurImagePromises);

  for (let i = 0; i < reducedResults.length; i++) {
    reducedResults[i].blurDataUrl = imagesWithBlurDataUrls[i];
  }

  return {
    props: {
      images: reducedResults,
    },
  };
}
