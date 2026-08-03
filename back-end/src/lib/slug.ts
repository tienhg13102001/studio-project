import type { QueryFilter, Model, Schema } from "mongoose";
import { WITH_DELETED } from "./softDelete.ts";

/**
 * Đường dẫn đọc được thay cho mã máy.
 *
 * Trước đây địa chỉ một dự án là /service/6a1ea3851b490b84af4d27ed/6a1ec667…
 * — 58 ký tự toàn mã. Dán lên Zalo hay Facebook thì trông như link rác, người
 * nhận không biết bên trong là gì nên ngại bấm; chính người quản trị nhìn cũng
 * không biết đó là dự án nào.
 *
 * Nay mỗi dịch vụ và mỗi dự án có thêm một "tên đường dẫn" sinh từ chính tiêu
 * đề của nó: /du-an/vf9-teaser-the-mark-of-leadership.
 *
 * MỘT NGUYÊN TẮC PHẢI GIỮ: tên đường dẫn sinh MỘT LẦN lúc tạo và KHÔNG đổi
 * theo tiêu đề nữa. Đổi tên đường dẫn là giết mọi link đã chia sẻ ra ngoài và
 * xoá sạch thứ hạng mà máy tìm kiếm đã tích cho địa chỉ đó. Sửa tiêu đề cho
 * đẹp là chuyện thường xuyên; địa chỉ thì phải bền.
 */

/** Bỏ dấu tiếng Việt, hạ chữ thường, nối bằng gạch ngang. */
export function slugify(input: string, maxWords = 8): string {
  const base = input
    .normalize("NFD")
    // Bỏ toàn bộ dấu thanh và dấu mũ đã được tách rời ở bước trên.
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    // `đ` KHÔNG tách được bằng NFD nên phải thay tay, nếu không sẽ bị xoá mất.
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Cắt bớt cho địa chỉ đỡ dài: tiêu đề dài lê thê thì lấy vài chữ đầu là đủ
  // nhận ra, phần đuôi không thêm thông tin gì cho người đọc.
  return base.split("-").filter(Boolean).slice(0, maxWords).join("-");
}

/**
 * Tìm một tên đường dẫn chưa ai dùng: trùng thì thêm đuôi -2, -3…
 *
 * TÍNH CẢ MỤC TRONG THÙNG RÁC: mục đã xoá vẫn có thể được khôi phục trong 30
 * ngày, nếu để mục mới chiếm mất tên của nó thì lúc khôi phục sẽ đụng nhau.
 */
export async function uniqueSlug<T>(
  model: Model<T>,
  base: string,
  excludeId?: unknown,
): Promise<string> {
  // Tiêu đề toàn ký tự lạ (ví dụ chỉ có emoji) thì slugify trả về rỗng.
  const root = base || "muc";

  for (let n = 1; n <= 200; n++) {
    const candidate = n === 1 ? root : `${root}-${n}`;
    const found = (await model
      .findOne({ slug: candidate } as QueryFilter<T>)
      .select("_id")
      .setOptions({ [WITH_DELETED]: true })
      .lean()) as { _id?: unknown } | null;

    if (!found) return candidate;
    if (excludeId && String(found._id) === String(excludeId)) return candidate;
  }

  // Không bao giờ nên tới đây. Thà ra một địa chỉ xấu còn hơn treo vòng lặp.
  return `${root}-${Date.now()}`;
}

type WithSlug = { slug?: string; _id?: unknown };

/**
 * Gắn ô `slug` vào một schema và tự điền lúc tạo mới.
 *
 * KHÔNG khai `unique: true`: khai vậy là bắt MongoDB dựng một chỉ mục duy nhất
 * ngay lúc máy chủ khởi động, mà dữ liệu cũ thì chưa có slug — chỉ cần một cặp
 * trùng là việc dựng chỉ mục hỏng và lỗi chỉ nằm im trong log. Ở đây chỉ có một
 * máy chủ ghi dữ liệu nên chặn trùng bằng `uniqueSlug` là đủ và không có rủi ro
 * làm sập lúc khởi động.
 */
export function slugPlugin(getSource: (doc: unknown) => string) {
  return function (schema: Schema): void {
    schema.add({ slug: { type: String, index: true } });

    // Hàm async KHÔNG nhận `next` — từ Mongoose 9 middleware nên trả về promise
    // thay vì gọi callback.
    schema.pre("save", async function (this: WithSlug) {
      if (this.slug) return; // đã có thì giữ nguyên, không đổi theo tiêu đề
      const model = (this as { constructor: unknown })
        .constructor as Model<Record<string, unknown>>;
      this.slug = await uniqueSlug(model, slugify(getSource(this)), this._id);
    });
  };
}

/**
 * Điền tên đường dẫn cho dữ liệu đã có sẵn, chạy một lần lúc máy chủ lên.
 *
 * VÌ SAO LÀM LÚC KHỞI ĐỘNG chứ không viết script chạy tay: máy chủ thật do bên
 * khác quản, không ai bảo đảm có người vào chạy script đúng lúc bản mới lên. Mà
 * chỉ cần một dự án thiếu slug là link của nó hỏng. Việc này rẻ (vài chục bản
 * ghi), tự bỏ qua khi đã xong, và HỎNG THÌ KHÔNG ĐƯỢC PHÉP CHẶN MÁY CHỦ KHỞI
 * ĐỘNG — thà web chạy với địa chỉ cũ còn hơn không chạy.
 */
export async function backfillSlugs<T>(
  model: Model<T>,
  getSource: (doc: unknown) => string,
  label: string,
): Promise<void> {
  try {
    const thieu = (await model
      .find({
        $or: [{ slug: { $exists: false } }, { slug: null }, { slug: "" }],
      } as QueryFilter<T>)
      .setOptions({ [WITH_DELETED]: true })
      .lean()) as unknown as (WithSlug & Record<string, unknown>)[];

    if (thieu.length === 0) return;

    for (const doc of thieu) {
      const slug = await uniqueSlug(model, slugify(getSource(doc)), doc._id);
      await model
        .updateOne({ _id: doc._id } as QueryFilter<T>, { $set: { slug } })
        .setOptions({ [WITH_DELETED]: true });
    }
    console.log(`[slug] Đã điền tên đường dẫn cho ${thieu.length} ${label}.`);
  } catch (e) {
    console.error(`[slug] Không điền được tên đường dẫn cho ${label}:`, e);
  }
}
