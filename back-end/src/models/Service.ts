import mongoose, { Schema, type Document, type PopulatedDoc } from "mongoose";
import type { IProject } from "./Project.ts";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

const faqItemSchema = new Schema(
  {
    question: { type: localizedString, required: true },
    answer:   { type: localizedString, required: true },
  },
  { _id: false },
);

export interface IFaqItem {
  question: { en: string; vi: string };
  answer:   { en: string; vi: string };
}

export interface IService extends Document {
  tag:            string;
  thumbnailImage: string;
  title:          { en: string; vi: string };
  description:    { en: string; vi: string };
  faqs:           IFaqItem[];
  projects:       PopulatedDoc<IProject>[];
}

const serviceSchema = new Schema<IService>(
  {
    tag:            { type: String, required: true, unique: true },
    thumbnailImage: { type: String, required: true },
    title:          { type: localizedString, required: true },
    description:    { type: localizedString, required: true },
    faqs:           { type: [faqItemSchema], default: [] },
    projects:       [{ type: Schema.Types.ObjectId, ref: "Project" }],
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

export const Service = mongoose.model<IService>("Service", serviceSchema);
