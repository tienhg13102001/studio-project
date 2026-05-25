import mongoose, { Schema, type Document } from "mongoose";
import type { PopulatedDoc } from "mongoose";
import type { IProject } from "./Project.ts";

export interface IBrand extends Document {
  name: string;
  logo: string; // path or URL to logo image
  projects: PopulatedDoc<IProject>[];
  order: number;
  active: boolean;
}

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: true },
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>)["_id"];
        return ret;
      },
    },
  },
);

export const Brand = mongoose.model<IBrand>("Brand", brandSchema);
