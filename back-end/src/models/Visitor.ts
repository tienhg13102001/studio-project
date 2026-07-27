import mongoose, { Schema, type Document } from "mongoose";

/**
 * Bộ đếm lượt truy cập.
 *
 * - `VisitorStat`: singleton (key: "global") giữ tổng số lượt truy cập cộng dồn.
 * - `VisitLog`: mỗi (IP-hash + ngày) là một document duy nhất (unique index) để
 *   một khách chỉ được tính 1 lần/ngày. Có TTL 2 ngày để collection tự dọn dẹp.
 */

export interface IVisitorStat extends Document {
  key: string;
  total: number;
}

const visitorStatSchema = new Schema<IVisitorStat>(
  {
    key:   { type: String, required: true, unique: true, default: "global" },
    total: { type: Number, default: 0 },
  },
  {
    toJSON: {
      versionKey: false,
      transform: (_doc, ret) => {
        const obj = ret as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete obj["_id"];
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete obj["key"];
        return ret;
      },
    },
  },
);

export const VisitorStat = mongoose.model<IVisitorStat>("VisitorStat", visitorStatSchema);

export interface IVisitLog extends Document {
  key: string; // `${ipHash}:${YYYY-MM-DD}`
  createdAt: Date;
}

const visitLogSchema = new Schema<IVisitLog>(
  {
    key:       { type: String, required: true, unique: true },
    // TTL: tự xoá sau 2 ngày (172800s) — chỉ dùng để chống trùng trong ngày.
    createdAt: { type: Date, default: Date.now, expires: 172800 },
  },
);

export const VisitLog = mongoose.model<IVisitLog>("VisitLog", visitLogSchema);

/**
 * Lượt truy cập duy nhất theo NGÀY — giữ vĩnh viễn (KHÔNG TTL) để dựng biểu đồ
 * xu hướng. Tăng cùng lúc với `VisitorStat.total` (mỗi khách unique/ngày = +1).
 */
export interface IVisitorDaily extends Document {
  day: string; // YYYY-MM-DD (UTC)
  count: number;
}

const visitorDailySchema = new Schema<IVisitorDaily>({
  day: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

export const VisitorDaily = mongoose.model<IVisitorDaily>("VisitorDaily", visitorDailySchema);

/**
 * Phân rã lượt truy cập theo chiều (nguồn / thiết bị) theo ngày — giữ vĩnh viễn.
 * Mỗi (ngày + dim + key) là một document (unique index), cộng dồn bằng $inc.
 * Ví dụ: { day: "2026-07-27", dim: "source", key: "facebook", count: 12 }.
 */
export interface IVisitorAgg extends Document {
  day: string; // YYYY-MM-DD
  dim: string; // "source" | "device"
  key: string; // "facebook" | "google" | "mobile" | ...
  count: number;
}

const visitorAggSchema = new Schema<IVisitorAgg>({
  day: { type: String, required: true },
  dim: { type: String, required: true },
  key: { type: String, required: true },
  count: { type: Number, default: 0 },
});
visitorAggSchema.index({ day: 1, dim: 1, key: 1 }, { unique: true });

export const VisitorAgg = mongoose.model<IVisitorAgg>("VisitorAgg", visitorAggSchema);
