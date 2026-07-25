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
