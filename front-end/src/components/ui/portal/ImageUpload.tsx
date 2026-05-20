import { useRef, useState } from "react";
import { UploadSimpleIcon, ImageIcon } from "@phosphor-icons/react";
import axios from "axios";
import { resolveAssetUrl } from "#lib/api";

type Props = {
  value:    string;
  onChange: (path: string) => void;
};

const inp =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";

export default function ImageUpload({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post<{ success: boolean; data: { path: string } }>(
        `${import.meta.env.VITE_API_URL ?? ""}/api/upload`,
        formData,
      );
      if (res.data.success) onChange(res.data.data.path);
      else setUploadError("Upload failed");
    } catch {
      setUploadError("Upload failed");
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
      <input
        className={inp}
        placeholder="/images/… or https://…"
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
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/15 bg-white/3 p-3 transition-colors hover:border-primary/30 hover:bg-primary/5"
      >
        {/* Preview / placeholder */}
        {previewSrc ? (
          <img
            src={previewSrc}
            alt="preview"
            className="h-10 w-16 shrink-0 rounded-md object-cover opacity-70"
          />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/25">
            <ImageIcon size={18} />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-xs text-white/50">
            <UploadSimpleIcon size={13} />
            {uploading ? "Uploading…" : "Click or drag to upload"}
          </p>
          <p className="mt-0.5 text-[10px] text-white/25">JPG, PNG, WebP · max 10 MB</p>
        </div>

        {uploading && (
          <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/15 border-t-primary" />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
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
