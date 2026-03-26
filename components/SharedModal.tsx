import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import { variants } from "../utils/animationVariants";
import type { SharedModalProps } from "../utils/types";
import Twitter from "./Icons/Twitter";

export default function SharedModal({
  index,
  images,
  closeModal,
  currentPhoto,
  direction,
}: SharedModalProps) {
  const currentImage = images ? images[index] : currentPhoto;

  if (!currentImage) {
    return null;
  }

  const currentImageWidth = Number(currentImage.width) > 0 ? Number(currentImage.width) : 1920;
  const currentImageHeight = Number(currentImage.height) > 0 ? Number(currentImage.height) : 1280;
  const shareUrl = `https://hochiminh-ai.vercel.app/p/${index}`;
  const tweetHref =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent("Check out this pic from Ho Chi Minh AI Enhance Photo Gallery!") +
    "%0A%0A" +
    encodeURIComponent(shareUrl);

  return (
    <MotionConfig
      transition={{
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 },
      }}
    >
      <div className="relative z-50 flex h-screen w-full max-w-7xl items-center justify-center px-2 py-16">
        <div className="flex h-full w-full items-center justify-center overflow-hidden">
          <div className="relative flex h-full w-full items-center justify-center">
            <AnimatePresence initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute flex h-full w-full items-center justify-center"
              >
                <Zoom>
                  <Image
                    key={currentImage.src}
                    src={currentImage.src}
                    width={currentImageWidth}
                    height={currentImageHeight}
                    priority
                    alt="Ho Chi Minh AI Image"
                    className="h-auto max-h-[calc(100vh-4rem)] w-auto max-w-full object-contain"
                  />
                </Zoom>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-0 top-0 p-3 text-white">
            <button
              onClick={closeModal}
              className="pointer-events-auto rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
              title="Close"
              aria-label="Close image"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <div className="absolute right-0 top-0 p-3 text-white">
            <a
              href={tweetHref}
              className="pointer-events-auto rounded-full bg-black/50 p-2 text-white/75 backdrop-blur-lg transition hover:bg-black/75 hover:text-white"
              target="_blank"
              title="Share this photo"
              rel="noreferrer"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
