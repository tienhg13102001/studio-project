import mongoose, { Schema, type Document } from "mongoose";
import { softDeletePlugin, type SoftDeleteModel } from "../lib/softDelete.ts";

export interface ICustomer extends Document {
  name:      string;
  email:     string;
  phone?:    string;
  service?:  string;
  message:   string;
  createdAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, trim: true },
    service: { type: String },
    message: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete (ret as Record<string, unknown>)["_id"];
        return ret;
      },
    },
  },
);

// Bật thùng rác: xoá là đánh dấu, tự dọn hẳn sau 30 ngày.
customerSchema.plugin(softDeletePlugin);

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema) as
  mongoose.Model<ICustomer> & SoftDeleteModel<ICustomer>;
