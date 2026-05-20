import mongoose, { Schema, type Document, type PopulatedDoc } from "mongoose";
import type { IFeature } from "./Feature.ts";

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
  order:       number;
  tag:         string;
  iconName:    string;
  image:       string;
  title:       { en: string; vi: string };
  description: { en: string; vi: string };
  faqs:        IFaqItem[];
  features:    PopulatedDoc<IFeature>[];
}

const serviceSchema = new Schema<IService>(
  {
    order:       { type: Number, required: true },
    tag:         { type: String, required: true, unique: true },
    iconName:    { type: String, required: true },
    image:       { type: String, required: true },
    title:       { type: localizedString, required: true },
    description: { type: localizedString, required: true },
    faqs:        { type: [faqItemSchema], default: [] },
    features:    [{ type: Schema.Types.ObjectId, ref: "Feature" }],
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
