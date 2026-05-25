import { Button } from "#components/ui/button";
import type { ProjectDisplay } from "#hooks/useProjects";
import { cn } from "#lib/utils";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  EyeIcon,
  FilmReelIcon,
  MapPinIcon,
  PlayCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useState, type CSSProperties, type FC } from "react";

type Props = {
  project: ProjectDisplay;
  onClose: () => void;
};

const ProjectDetail: FC<Props> = ({ project, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayVideo, setIsPlayVideo] = useState(false);
  const totalImages = project?.photos?.length || 0;
  console.log("🚀 ~ ProjectDetail ~ totalImages:", totalImages)

  const handleNext = () => {
    if (currentIndex < totalImages - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Hàm tính toán CSS linh hoạt cho từng thẻ ảnh dựa trên vị trí của nó so với ảnh hiện tại
  const getCardStyle = (index: number): CSSProperties => {
    const offset = index - currentIndex;

    if (offset === 0) {
      // Thẻ đang hiển thị chính (Active)
      return {
        transform: "translateY(0px) scale(1) rotate(0deg)",
        transformOrigin: "bottom center",
        zIndex: 20,
        opacity: 1,
      };
    } else if (offset > 0 && offset <= 3) {
      // Các thẻ phía sau — hiệu ứng xoè bài
      const rotation = offset * 7; // 7°, 14°, 21°
      const translateY = offset * 10; // dịch xuống 10px, 20px, 30px
      const scale = 1 - offset * 0.03; // thu nhỏ nhẹ theo khoảng cách
      const zIndex = 20 - offset * 5; // z-index giảm dần
      return {
        transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
        transformOrigin: "bottom center",
        zIndex,
        opacity: 1,
        pointerEvents: "none" as const,
      };
    } else if (offset > 3) {
      // Các thẻ quá xa — ẩn đi, giữ vị trí cuối của nhóm xoè
      return {
        transform: "translateY(30px) scale(0.91) rotate(28deg)",
        transformOrigin: "bottom center",
        zIndex: 0,
        opacity: 0,
        pointerEvents: "none" as const,
      };
    } else {
      // Các thẻ đã qua — trượt sang trái và biến mất
      return {
        transform: "translateX(-110%) scale(0.95) rotate(-5deg)",
        transformOrigin: "bottom center",
        zIndex: 30,
        opacity: 0,
        pointerEvents: "none" as const,
      };
    }
  };

  return (
    <div className="bg-background/90 fixed z-50 flex h-dvh w-screen items-center justify-center overflow-hidden font-sans text-white transition-opacity duration-300">
      {/* Icon close */}
      <Button
        onClick={onClose}
        className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <XIcon size={20} />
      </Button>
      {/* Container chính */}
      <div className={cn('relative flex w-full flex-col items-center gap-5 px-8 lg:flex-row lg:gap-10', totalImages > 0 ? "lg:justify-start" : "lg:justify-center")}>
        {/* CỘT TRÁI: VIDEO NẾU CÓ */}
        {project.video && (
          <div className="relative flex w-full justify-center lg:w-1/2">
            {isPlayVideo ? (
              <video
                src={project.video}
                controls
                autoPlay /* THÊM THUỘC TÍNH NÀY ĐỂ VIDEO TỰ CHẠY */
                className="h-auto max-h-[80vh] w-full rounded-2xl object-cover shadow-2xl"
              />
            ) : (
              <>
                {/* Nhóm thẻ img và nút Play vào chung phần điều kiện false */}
                <img
                  src={project.thumbnailImage}
                  alt="Thumbnail"
                  className="h-auto max-h-[80vh] w-full rounded-2xl object-cover shadow-2xl"
                />

                {/* Nút play giờ chỉ hiện khi isPlayVideo là false */}
                <Button
                  className="bg-primary absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full text-black backdrop-blur-md transition-colors hover:bg-yellow-500"
                  onClick={() => setIsPlayVideo(true)}
                >
                  <PlayCircleIcon size={32} />
                </Button>
              </>
            )}
          </div>
        )}
        {/* CỘT GIỮA: THÔNG TIN (Info Column) */}
        <div className="border-border z-30 flex h-fit w-full flex-col justify-center space-y-8 rounded-3xl border px-10 py-20 backdrop-blur-sm lg:w-2/5">
          {/* Header Info */}
          <div>
            <span className="mb-4 inline-block rounded-md bg-yellow-500/20 px-3 py-1 text-sm font-medium text-yellow-500">
              {project.tag}
            </span>
            <h1 className="mb-4 flex items-center gap-3 text-4xl font-bold">
              <span className="rounded-lg bg-white/10 p-2">
                <FilmReelIcon size={24} className="text-white" />
              </span>
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <MapPinIcon size={16} /> {project.id}
              </div>
              {/* <div className="flex items-center gap-2">
                <Calendar size={16} /> {project.year}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} /> {project.duration}
              </div> */}
            </div>
          </div>

          <div className="border-0.5 border" />

          {/* About */}
          <div>
            <h3 className="mb-2 text-sm font-semibold tracking-wider text-gray-400 uppercase">
              About
            </h3>
            <p className="text-sm leading-relaxed text-gray-300">{project.subtitle}</p>
          </div>

          {/* Production Team */}
          {/* <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-400 mb-4 uppercase">Production Team</h3>
            <div className="space-y-3 text-sm">
              {project.crew.map((member, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-2">
                  <div className="flex items-center gap-3 text-gray-400">
                    {member.icon}
                    <span>{member.role}</span>
                  </div>
                  <span className="text-gray-200">{member.name}</span>
                </div>
              ))}
            </div>
          </div> */}

          {/* Action Button */}
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-600 py-3 font-semibold text-black transition-colors hover:bg-yellow-500">
            Watch More <PlayCircleIcon size={20} />
          </button>
        </div>

        {/* CỘT PHẢI: SLIDER HÌNH ẢNH (Slider Column) */}
        {project.photos && totalImages > 0 && (
          <div className="relative flex h-100 w-full items-center lg:h-150 lg:w-3/5">
            {/* Khu vực chứa các thẻ ảnh (Perspective để tạo chiều sâu nếu cần, ở đây dùng 2D transform cho đơn giản và mượt) */}
            <div className="relative flex h-full w-full items-center justify-center md:h-[80%]">
              {project.photos.map((image, index) => {
                const overlayOpacity = Math.min(Math.max(index - currentIndex, 0) * 0.3, 0.85);
                return (
                  <div
                    key={index}
                    className="absolute top-0 left-0 h-full w-full origin-center overflow-hidden rounded-2xl bg-gray-900 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] md:w-[85%]"
                    style={getCardStyle(index)}
                  >
                    {/* Hình nền */}
                    <img src={image} alt={image} className="h-full w-full object-cover" />

                    {/* Lớp phủ gradient để dễ đọc text */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20"></div>

                    {/* Lớp phủ đen — tối dần theo khoảng cách */}
                    <div
                      className="absolute inset-0 bg-black transition-all duration-700"
                      style={{ opacity: overlayOpacity }}
                    ></div>

                    {/* Số thứ tự góc trên phải */}
                    <div className="absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm font-medium tracking-widest text-white backdrop-blur-sm">
                      {index + 1} / {totalImages}
                    </div>

                    {/* Tiêu đề & Icon ở góc dưới */}
                    <div className="absolute right-6 bottom-6 left-6 flex items-end justify-between">
                      <h2 className="text-xl font-semibold text-white shadow-sm md:text-2xl">
                        {project.title}
                      </h2>
                      <button className="rounded-full bg-black/40 p-3 backdrop-blur-md transition-colors hover:bg-white/20">
                        <EyeIcon size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Điều hướng (Navigation Controls) - Căn giữa ở dưới cùng */}
            <div className="absolute -bottom-20 left-0 z-40 flex w-full flex-col items-center gap-4 md:-bottom-10">
              {/* Nút bấm */}
              <div className="flex items-center gap-6">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className={`flex items-center justify-center rounded-full p-3 transition-all ${
                    currentIndex === 0
                      ? "cursor-not-allowed bg-gray-800/50 text-gray-600"
                      : "bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  }`}
                >
                  <ArrowLeftIcon size={24} />
                </button>

                <span className="text-sm tracking-widest text-gray-400 uppercase">
                  Click arrows
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentIndex === totalImages - 1}
                  className={`flex items-center justify-center rounded-full p-3 transition-all ${
                    currentIndex === totalImages - 1
                      ? "cursor-not-allowed bg-gray-800/50 text-gray-600"
                      : "bg-white/10 text-white backdrop-blur-md hover:bg-white/20"
                  }`}
                >
                  <ArrowRightIcon size={24} />
                </button>
              </div>

              {/* Dấu chấm chỉ báo (Dots indicator) */}
              <div className="flex items-center gap-2">
                {project.photos &&
                  project.photos.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "bg-primary w-6" : "w-1.5 bg-gray-600"}`}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
