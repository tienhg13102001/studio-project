import { useState, type CSSProperties, type FC } from "react";
import { resolveAssetUrl } from "#lib/api";

type ProjectDetailProps = {
  project: {
    title: string;
    video?: string;
    photos?: string[];
    // ...other fields
  };
};

const ProjectDetail: FC<ProjectDetailProps> = ({ project }) => {
  const images = project.photos ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalImages = images.length;

  const handleNext = () => {
    if (currentIndex < totalImages - 1) setCurrentIndex((prev) => prev + 1);
  };
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };
  const getCardStyle = (index: number): CSSProperties => {
    const offset = index - currentIndex;
    if (offset === 0) {
      return {
        transform: "translateY(0px) scale(1) rotate(0deg)",
        transformOrigin: "bottom center",
        zIndex: 20,
        opacity: 1,
      };
    } else if (offset > 0 && offset <= 3) {
      const rotation = offset * 7;
      const translateY = offset * 10;
      const scale = 1 - offset * 0.03;
      const zIndex = 20 - offset * 5;
      return {
        transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: "bottom center",
        zIndex,
        opacity: 1,
        pointerEvents: "none" as const,
      };
    } else if (offset > 3) {
      return {
        transform: "translateY(30px) scale(0.91) rotate(28deg)",
        transformOrigin: "bottom center",
        zIndex: 0,
        opacity: 0,
        pointerEvents: "none" as const,
      };
    } else {
      return {
        transform: "translateX(-110%) scale(0.95) rotate(-5deg)",
        transformOrigin: "bottom center",
        zIndex: 30,
        opacity: 0,
        pointerEvents: "none" as const,
      };
    }
  };

  // Hiển thị video nếu có
  const hasVideo = !!project.video;

  return (
    <div className="relative flex h-100 w-full flex-col items-center lg:h-150 lg:w-3/5">
      {hasVideo && (
        <div className="mb-8 w-full">
          <video
            src={resolveAssetUrl(project.video!)}
            controls
            className="max-h-96 w-full rounded-xl bg-black shadow-lg"
            preload="metadata"
          />
        </div>
      )}
      {images.length > 0 && (
        <div className="relative flex h-full w-full items-center justify-center md:h-[80%]">
          {images.map((img, index) => {
            const overlayOpacity = Math.min(Math.max(index - currentIndex, 0) * 0.3, 0.85);
            return (
              <div
                key={img}
                className="absolute top-0 left-0 h-full w-full origin-center overflow-hidden rounded-2xl bg-gray-900 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] md:w-[85%]"
                style={getCardStyle(index)}
              >
                <img
                  src={resolveAssetUrl(img)}
                  alt={project.title}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20"></div>
                <div
                  className="absolute inset-0 bg-black transition-all duration-700"
                  style={{ opacity: overlayOpacity }}
                ></div>
                <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium tracking-widest text-white backdrop-blur-sm">
                  {index + 1} / {totalImages}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {images.length > 0 && (
        <div className="absolute -bottom-20 left-0 z-40 flex w-full flex-col items-center gap-4 md:-bottom-10">
          <div className="flex items-center gap-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center justify-center rounded-full p-3 transition-all ${currentIndex === 0 ? "cursor-not-allowed bg-gray-800/50 text-gray-600" : "bg-white/10 text-white backdrop-blur-md hover:bg-white/20"}`}
            >
              &#8592;
            </button>
            <span className="text-sm tracking-widest text-gray-400 uppercase">Click arrows</span>
            <button
              onClick={handleNext}
              disabled={currentIndex === totalImages - 1}
              className={`flex items-center justify-center rounded-full p-3 transition-all ${currentIndex === totalImages - 1 ? "cursor-not-allowed bg-gray-800/50 text-gray-600" : "bg-white/10 text-white backdrop-blur-md hover:bg-white/20"}`}
            >
              &#8594;
            </button>
          </div>
          <div className="flex items-center gap-2">
            {images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-gray-600"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
