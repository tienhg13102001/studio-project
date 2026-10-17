import { resolveAssetUrl, uploadImageChunked, IMAGE_MAX_MB } from "#lib/api";
import UploadProgressBar from "#components/ui/portal/UploadProgressBar";
import { ImageIcon, TrashIcon } from "@phosphor-icons/react";
import { useRef, useState } from "react";

export type ImagesUploadProps = {
  value: string[];
  onChange: (paths: string[]) => void;
};

/** Tiến độ cả loạt: đang ở ảnh thứ mấy trên tổng bao nhiêu. */
type TienDo = { dangLam: number; tong: number; phanTramAnh: number };

export default function ImagesUpload({ value, onChange }: ImagesUploadProps) {
  const [tienDo, setTienDo] = useState<TienDo | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploading = tienDo !== null;

  /** Bấm "Dừng": xong ảnh đang tải thì thôi, không tải tiếp những ảnh còn lại. */
  const dungLai = useRef(false);

  /**
   * Tải LẦN LƯỢT từng ảnh chứ không song song: máy chủ chỉ có 2 nhân và 1,9 GB
   * RAM, mỗi ảnh được ghép từ mảnh 50 MB trong bộ nhớ rồi mới thu nhỏ. Tải mười
   * ảnh cùng lúc là mười khối 50 MB cộng với mười lần xử lý ảnh — dễ làm máy hết
   * RAM và bị hệ điều hành giết tiến trình (đã xảy ra với video ngày 30/09).
   */
  const handleFiles = async (files: File[]) => {
    if (uploading || files.length === 0) return;

    const anh = files.filter((f) => f.type.startsWith("image/"));
    const boQua = files.length - anh.length;
    if (anh.length === 0) {
      setUploadError("Không có file ảnh nào trong số vừa chọn.");
      return;
    }

    setUploadError(null);
    dungLai.current = false;
    const loi: string[] = [];

    /**
     * ẢNH ĐÃ CÓ TRƯỚC LOẠT NÀY (chụp lại một lần) + ẢNH ĐÃ TẢI TRONG LOẠT NÀY.
     *
     * Không được nối vào `value` ở giữa vòng lặp: `value` bị "đóng băng" ở lúc
     * vòng lặp bắt đầu, nên ảnh thứ hai sẽ ghi đè mất ảnh thứ nhất — cả loạt chỉ
     * còn lại ảnh cuối. Tự giữ hai danh sách riêng thì kết quả không phụ thuộc
     * chuyện React dựng lại kịp hay chưa giữa hai ảnh.
     *
     * Đổi lại, trong lúc tải không cho xoá ảnh (nút xoá ẩn đi) — nếu không thì ảnh
     * vừa xoá sẽ sống lại ở lần ghi tiếp theo.
     */
    const anhCoSan = value;
    const anhMoi: string[] = [];

    for (let i = 0; i < anh.length; i++) {
      if (dungLai.current) break;
      const file = anh[i]!;
      setTienDo({ dangLam: i + 1, tong: anh.length, phanTramAnh: 0 });

      if (file.size > IMAGE_MAX_MB * 1024 * 1024) {
        loi.push(`${file.name} (quá lớn, tối đa ${IMAGE_MAX_MB} MB)`);
        continue;
      }
      try {
        const kq = await uploadImageChunked(file, (p) =>
          setTienDo({ dangLam: i + 1, tong: anh.length, phanTramAnh: p.percent }),
        );
        // Ghi NGAY từng ảnh vào form, không đợi cả loạt: tải dở mà mất mạng thì
        // những ảnh đã lên vẫn còn, không phải tải lại từ đầu.
        anhMoi.push(kq.url ?? kq.path);
        onChange([...anhCoSan, ...anhMoi]);
      } catch (e) {
        loi.push(`${file.name} (${(e as Error).message})`);
      }
    }

    setTienDo(null);

    const dong: string[] = [];
    if (dungLai.current) dong.push(`Đã dừng sau khi tải ${anhMoi.length}/${anh.length} ảnh.`);
    if (loi.length) dong.push(`Lỗi ${loi.length} ảnh: ${loi.join("; ")}.`);
    if (boQua) dong.push(`Bỏ qua ${boQua} file không phải ảnh.`);
    if (dong.length) setUploadError(dong.join(" "));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    void handleFiles(Array.from(e.dataTransfer.files));
  };

  // Phần trăm của CẢ LOẠT: ảnh đã xong + phần đã tải của ảnh đang làm.
  const tongPhanTram = tienDo
    ? ((tienDo.dangLam - 1 + tienDo.phanTramAnh / 100) / tienDo.tong) * 100
    : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((img, idx) => (
          <div key={img} className="relative group">
            <img src={resolveAssetUrl(img)} alt="photo" className="w-20 h-20 object-cover rounded border border-foreground/10" />
            {!uploading && (
              <button
                type="button"
                className="absolute top-0 right-0 bg-black/60 text-white p-1 rounded-bl-lg opacity-0 group-hover:opacity-100 transition"
                onClick={() => onChange(value.filter((_, i) => i !== idx))}
                title="Remove"
              >
                <TrashIcon size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex items-center gap-2 rounded-lg border border-dashed border-foreground/20 bg-foreground/5 px-4 py-3 text-foreground/60 hover:bg-foreground/5 cursor-pointer"
        onClick={() => !uploading && inputRef.current?.click()}
      >
        <ImageIcon size={20} />
        {tienDo ? (
          <span>
            {tienDo.tong > 1 ? `Ảnh ${tienDo.dangLam}/${tienDo.tong} · ` : ""}
            {tienDo.phanTramAnh >= 100
              ? "đang xử lý ảnh trên server…"
              : `đang tải lên… ${tienDo.phanTramAnh}%`}
          </span>
        ) : (
          <span>Click or drop images — chọn được nhiều ảnh cùng lúc (jpg/png/webp · tối đa {IMAGE_MAX_MB} MB mỗi ảnh)</span>
        )}
        {tienDo && (
          <div className="border-t-primary ml-auto h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-foreground/15" />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            // Chép ra mảng TRƯỚC khi xoá giá trị: gán value="" làm rỗng luôn
            // danh sách file. Xoá để lần sau chọn lại đúng những ảnh đó vẫn nổ
            // sự kiện (không xoá thì trình duyệt coi như không có gì đổi).
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void handleFiles(files);
          }}
        />
      </div>
      {/* Đặt ngoài khung kéo-thả vì khung đó xếp ngang, nhét thanh vào sẽ chen cột. */}
      {tienDo && (
        <div className="flex flex-col gap-1.5">
          <UploadProgressBar
            percent={tongPhanTram}
            phase={tienDo.tong === 1 && tienDo.phanTramAnh >= 100 ? "processing" : "uploading"}
          />
          {tienDo.tong > 1 && (
            <button
              type="button"
              onClick={() => {
                dungLai.current = true;
              }}
              className="text-foreground/50 hover:text-foreground self-start text-xs underline underline-offset-2"
            >
              Dừng sau ảnh này
            </button>
          )}
        </div>
      )}
      {uploadError && <div className="text-xs text-red-400">{uploadError}</div>}
    </div>
  );
}
