import { resolveAssetUrl, uploadImageChunked, IMAGE_MAX_MB } from "#lib/api";
import { ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";

export type ImagesUploadProps = {
  value: string[];
  onChange: (paths: string[]) => void;
};

// const inp =
//   "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-primary/50 focus:outline-none transition-colors";

export default function ImagesUpload({ value, onChange }: ImagesUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
      setUploadError(`File quá lớn, tối đa ${IMAGE_MAX_MB} MB`);
      return;
    }
    setUploading(true);
    setUploadError(null);
    setProgress(0);
    try {
      const result = await uploadImageChunked(file, (p) => setProgress(p.percent));
      onChange([...value, result.url ?? result.path]);
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((img, idx) => (
          <div key={img} className="relative group">
            <img src={resolveAssetUrl(img)} alt="photo" className="w-20 h-20 object-cover rounded border border-foreground/10" />
            <button
              type="button"
              className="absolute top-0 right-0 bg-black/60 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
              title="Remove"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        ))}
      </div>
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex items-center gap-2 rounded-lg border border-dashed border-foreground/20 bg-foreground/5 px-4 py-3 text-foreground/60 hover:bg-foreground/5 cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        <ImageIcon size={20} />
        {uploading ? (
          <span>Đang tải lên… {progress}%</span>
        ) : (
          <span>Click or drop image (jpg/png/webp · tối đa 500 MB)</span>
        )}
        {uploading && (
          <div className="border-t-primary ml-auto h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-foreground/15" />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
      </div>
      {uploadError && <div className="text-xs text-red-400">{uploadError}</div>}
    </div>
  );
}
