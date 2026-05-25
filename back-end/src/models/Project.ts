import mongoose, { Schema, type Document, type PopulatedDoc } from "mongoose";
import type { IService } from "./Service.ts";

export interface IProject extends Document {
  layout: "vertical" | "horizontal";
  service: PopulatedDoc<IService>;
  thumbnailImage: string;
  title: string;
  subtitle: string;
  prominent: boolean;
  video?: string; // optional, path to video file
}

const projectSchema = new Schema<IProject>(
  {
    layout:         { type: String, enum: ["vertical", "horizontal"], required: true },
    service:        { type: Schema.Types.ObjectId, ref: "Service", required: true },
    thumbnailImage: { type: String, required: true },
    title:          { type: String, required: true },
    subtitle:       { type: String, required: true },
    prominent:      { type: Boolean, default: false },
    video:          { type: String, required: false }, // path to video file (optional)
  },
  {
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

export const Project = mongoose.model<IProject>("Project", projectSchema);
