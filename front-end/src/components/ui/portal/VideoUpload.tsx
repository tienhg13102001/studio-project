import { Input } from "#components/ui/input";
import { resolveAssetUrl, uploadVideo } from "#lib/api";
import { FilmReelIcon, UploadSimpleIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";

export type VideoUploadProps = {
  value: string;
  onChange: (path: string) => void;
};

export default function VideoUpload({ value, onChange }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setProgress(0);
    try {
      const result = await uploadVideo(file, (p) => setProgress(p.percent));
      onChange(result.url ?? result.path);
    } catch (e) {
      setUploadError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  };

  const previewSrc = value ? resolveAssetUrl(value) : null;

  return (
    <div className="flex flex-col gap-2">
      {/* Manual URL input */}
      <Input
        placeholder="/videos/… or https://…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {/* Upload area */}
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        className="hover:border-primary/30 hover:bg-primary/5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-foreground/15 bg-foreground/3 p-3 transition-colors"
      >
        {previewSrc ? (
          <video
            src={previewSrc}
            muted
            playsInline
            preload="metadata"
            className="h-10 w-16 shrink-0 rounded-md object-cover opacity-70"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-foreground/25">
            <FilmReelIcon size={18} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs text-foreground/50">
            <UploadSimpleIcon size={13} />
            {uploading ? `Uploading… ${progress}%` : "Click or drag to upload"}
          </p>
          <p className="mt-0.5 text-[10px] text-foreground/25">MP4, WebM, MOV, M4V · max 500 MB</p>
        </div>

        {uploading && (
          <div className="border-t-primary h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-foreground/15" />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
      </div>

      {uploadError && <p className="text-[10px] text-red-400">{uploadError}</p>}
    </div>
  );
}
