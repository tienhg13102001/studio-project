import { cn } from "#lib/utils";
import {
  ArrowClockwiseIcon,
  ArrowCounterClockwiseIcon,
  ArrowsInIcon,
  ArrowsOutIcon,
  PauseIcon,
  PlayIcon,
  SpeakerHighIcon,
  SpeakerLowIcon,
  SpeakerSlashIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useRef, useState, type FC } from "react";

type Props = {
  src: string;
  poster?: string;
  alt?: string;
  className?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  /** Extra classes on the control bar — e.g. to lift it above an overlapping
   *  bottom sheet on mobile. Ignored while fullscreen. */
  controlsClassName?: string;
};

/** Seconds → "m:ss" (or "h:mm:ss" past an hour). NaN/∞ → "0:00". */
function formatTime(value: number): string {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const total = Math.floor(value);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, "0");
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${ss}`;
  return `${m}:${ss}`;
}

const HIDE_DELAY = 2500;

const MediaPlayer: FC<Props> = ({
  src,
  poster,
  alt,
  className,
  videoClassName,
  autoPlay = false,
  controlsClassName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(autoPlay); // autoplay needs to start muted
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // ── Auto-hide controls while playing ──────────────────────────────────────
  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      // Pull the latest playing state off the element to avoid stale closures.
      if (videoRef.current && !videoRef.current.paused) setControlsVisible(false);
    }, HIDE_DELAY);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  // ── Keep fullscreen state in sync (Esc, etc.) ─────────────────────────────
  useEffect(() => {
    const onFs = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
    showControls();
  };

  const seekBy = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), video.duration || 0);
    showControls();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.currentTime = value;
    setCurrentTime(value);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    // Un-muting at zero volume should restore audible level.
    if (!video.muted && video.volume === 0) {
      video.volume = 1;
      setVolume(1);
    }
    showControls();
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const value = Number(e.target.value);
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
    showControls();
  };

  const VolumeIcon = muted || volume === 0 ? SpeakerSlashIcon : volume < 0.5 ? SpeakerLowIcon : SpeakerHighIcon;
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        "group/player relative cursor-pointer overflow-hidden bg-black",
        className,
        // In fullscreen the element fills the screen — drop the size caps from
        // `className` and center the video so it isn't pinned to a corner.
        isFullscreen &&
          "flex max-h-none! max-w-none! items-center justify-center rounded-none",
      )}
      onClick={togglePlayPause}
      onMouseMove={showControls}
      onMouseLeave={() => isPlaying && setControlsVisible(false)}
    >
      {/* Poster shown before first play */}
      {!hasStarted && poster && (
        <img
          src={poster}
          alt={alt}
          className={cn("h-full w-full object-cover", videoClassName)}
        />
      )}

      <video
        ref={videoRef}
        src={src}
        playsInline
        autoPlay={autoPlay}
        muted={autoPlay}
        onPlay={() => {
          setIsPlaying(true);
          setHasStarted(true);
          showControls();
        }}
        onPause={() => {
          setIsPlaying(false);
          setControlsVisible(true);
          if (hideTimer.current) window.clearTimeout(hideTimer.current);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setControlsVisible(true);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration);
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        className={cn(
          "h-full w-full cursor-pointer object-cover",
          !hasStarted && poster && "pointer-events-none absolute inset-0 opacity-0",
          videoClassName,
          // Letterbox-fit and center within the fullscreen container.
          isFullscreen && "h-full! max-h-none! w-full! max-w-none! object-contain",
        )}
      />

      {/* Big center play/pause affordance — visible while paused */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300",
          isPlaying ? "opacity-0" : "opacity-100",
        )}
      >
        <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
          {isPlaying ? <PauseIcon size={32} weight="fill" /> : <PlayIcon size={32} weight="fill" />}
        </div>
      </div>

      {/* ── Control bar ───────────────────────────────────────────────────── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute right-0 bottom-0 left-0 z-10 flex flex-col gap-2 bg-linear-to-t from-black/80 via-black/40 to-transparent px-3 pt-8 pb-3 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "pointer-events-none opacity-0",
          // Consumer offset (e.g. above a bottom sheet) — never in fullscreen.
          !isFullscreen && controlsClassName,
        )}
      >
        {/* Seek / progress bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step="any"
          value={currentTime}
          onChange={handleSeek}
          aria-label="Seek"
          style={{
            background: `linear-gradient(to right, var(--primary) ${progress}%, rgba(255,255,255,0.25) ${progress}%)`,
          }}
          className="accent-primary h-1 w-full cursor-pointer appearance-none rounded-full outline-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
        />

        <div className="flex items-center gap-2 text-white">
          {/* Skip back */}
          <button
            type="button"
            onClick={() => seekBy(-10)}
            aria-label="Tua lại 10 giây"
            className="hover:text-primary flex h-8 w-8 items-center justify-center transition-colors"
          >
            <ArrowCounterClockwiseIcon size={20} />
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={togglePlayPause}
            aria-label={isPlaying ? "Tạm dừng" : "Phát"}
            className="hover:text-primary flex h-8 w-8 items-center justify-center transition-colors"
          >
            {isPlaying ? (
              <PauseIcon size={22} weight="fill" />
            ) : (
              <PlayIcon size={22} weight="fill" />
            )}
          </button>

          {/* Skip forward */}
          <button
            type="button"
            onClick={() => seekBy(10)}
            aria-label="Tua tới 10 giây"
            className="hover:text-primary flex h-8 w-8 items-center justify-center transition-colors"
          >
            <ArrowClockwiseIcon size={20} />
          </button>

          {/* Mute + volume */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
              className="hover:text-primary flex h-8 w-8 items-center justify-center transition-colors"
            >
              <VolumeIcon size={20} weight="fill" />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={handleVolume}
              aria-label="Âm lượng"
              style={{
                background: `linear-gradient(to right, var(--primary) ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.25) ${(muted ? 0 : volume) * 100}%)`,
              }}
              className="accent-primary hidden h-1 w-16 cursor-pointer appearance-none rounded-full outline-none sm:block [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:h-2.5 [&::-moz-range-thumb]:w-2.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
            />
          </div>

          {/* Time */}
          <span className="ml-1 text-xs font-medium tabular-nums text-white/90">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="flex-1" />

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Thoát toàn màn hình" : "Toàn màn hình"}
            className="hover:text-primary flex h-8 w-8 items-center justify-center transition-colors"
          >
            {isFullscreen ? <ArrowsInIcon size={20} /> : <ArrowsOutIcon size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
