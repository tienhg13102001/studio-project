import { cn } from "#lib/utils";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import { useRef, useState, type FC } from "react";

type Props = {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  videoClassName?: string;
  autoPlay?: boolean;
};

const MediaPlayer: FC<Props> = ({
  src,
  poster,
  alt,
  className,
  videoClassName,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const overlayTimer = useRef<number | null>(null);

  const flashOverlay = () => {
    setShowOverlay(true);
    if (overlayTimer.current) window.clearTimeout(overlayTimer.current);
    overlayTimer.current = window.setTimeout(() => {
      setShowOverlay(false);
    }, 800);
  };

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  };

  return (
    <div
      className={cn("relative cursor-pointer overflow-hidden bg-black", className)}
      onClick={togglePlayPause}
    >
      {/* Poster shown before first play */}
      {!hasStarted && poster && (
        <img src={poster} alt={alt} className={cn("h-full w-full object-cover", videoClassName)} />
      )}

      <video
        ref={videoRef}
        src={src}
        playsInline
        autoPlay={autoPlay}
        onPlay={() => {
          setIsPlaying(true);
          setHasStarted(true);
          flashOverlay();
        }}
        onPause={() => {
          setIsPlaying(false);
          setShowOverlay(true);
          if (overlayTimer.current) window.clearTimeout(overlayTimer.current);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setShowOverlay(true);
        }}
        className={cn(
          "h-full w-full object-cover",
          !hasStarted && poster && "pointer-events-none absolute inset-0 opacity-0",
          videoClassName,
        )}
      />

      {/* Play / Pause overlay */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          showOverlay || !isPlaying ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
          {isPlaying ? (
            <PauseIcon size={32} weight="fill" />
          ) : (
            <PlayIcon size={32} weight="fill" />
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
