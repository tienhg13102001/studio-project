import { resolveAssetUrl, uploadVideo } from "#lib/api";
import { FilmStripIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Input } from "#components/ui/input";

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
      onChange(result.path);
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
        className="flex items-center gap-2 rounded-lg border border-dashed border-white/20 bg-black/10 px-4 py-3 text-white/60 hover:bg-white/5 cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        <FilmStripIcon size={20} />
        {uploading ? (
          <span>Uploading… {progress}%</span>
        ) : (
          <span>Click or drop video (mp4/webm/mov, ≤500MB)</span>
        )}
        <Input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>

      {uploadError && (
        <div className="text-xs text-red-400">{uploadError}</div>
      )}

      {previewSrc && (
        <video
          src={previewSrc}
          controls
          className="w-full max-h-48 rounded-lg mt-2 bg-black"
          preload="metadata"
        />
      )}
    </div>
  );
}
