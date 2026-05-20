import mongoose, { Schema, type Document, type PopulatedDoc } from "mongoose";
import type { IService } from "./Service.ts";

export interface IFeature extends Document {
  layout: "vertical" | "horizontal";
  order: number;
  tag: PopulatedDoc<IService>;
  image: string;
  title: string;
  subtitle: string;
  prominent: boolean;
}

const featureSchema = new Schema<IFeature>(
  {
    layout:    { type: String, enum: ["vertical", "horizontal"], required: true },
    order:     { type: Number, required: true },
    tag:       { type: Schema.Types.ObjectId, ref: "Service", required: true },
    image:     { type: String, required: true },
    title:     { type: String, required: true },
    subtitle:  { type: String, required: true },
    prominent: { type: Boolean, default: false },
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

export const Feature = mongoose.model<IFeature>("Feature", featureSchema);
