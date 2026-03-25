import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import Head from "next/head";
import Carousel from "../../components/Carousel";
import { readPhotosManifest } from "../../utils/photosManifest";
import type { ImageProps } from "../../utils/types";

const Home: NextPage<{ currentPhoto: ImageProps | null }> = ({ currentPhoto }) => {
  const index = currentPhoto?.id ?? 0;

  const currentPhotoUrl = currentPhoto
    ? currentPhoto.src
    : "https://hochiminh-ai.vercel.app/og-image.png";

  return (
    <>
      <Head>
        <title>Tấm gương rạng ngời dân tộc, sự kết hợp giữa khôn khéo chiến lược và đạo đức bền vững qua nhiều thập kỷ thử thách là minh chứng cho tài năng mọi thời đại.</title>
        <meta property="og:image" content={currentPhotoUrl} />
        <meta name="twitter:image" content={currentPhotoUrl} />
      </Head>
      <main className="mx-auto max-w-490 p-4">
        {currentPhoto && <Carousel currentPhoto={currentPhoto} index={index} />}
        {!currentPhoto && (
          <div className="text-center text-white/70">Photo not found.</div>
        )}
      </main>
    </>
  );
};

export default Home;

export const getStaticProps: GetStaticProps = async (context) => {
  const images = await readPhotosManifest();
  const currentPhoto = images.find(
    (image) => image.id === Number(context.params?.photoId),
  ) || null;

  return {
    props: {
      currentPhoto,
    },
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const images = await readPhotosManifest();

  return {
    paths: images.map((_, i) => ({ params: { photoId: i.toString() } })),
    fallback: false,
  };
};
