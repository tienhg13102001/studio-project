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

// ── Feature highlight cards shown on the service detail page ──────────────────
const highlightItemSchema = new Schema(
  {
    icon:  { type: String, default: "" }, // phosphor icon key (see serviceIcons on FE)
    title: { type: localizedString, required: true },
    desc:  { type: localizedString, required: true },
  },
  { _id: false },
);

export interface IHighlightItem {
  icon:  string;
  title: { en: string; vi: string };
  desc:  { en: string; vi: string };
}

// ── Stat counters shown below the highlights ─────────────────────────────────
const statItemSchema = new Schema(
  {
    value: { type: String, required: true },        // e.g. "1000+", "1B+"
    label: { type: localizedString, required: true },
  },
  { _id: false },
);

export interface IStatItem {
  value: string;
  label: { en: string; vi: string };
}

export interface IService extends Document {
  tag:            string;
  thumbnailImage: string;
  title:          { en: string; vi: string };
  description:    { en: string; vi: string };
  /** Small accent line under the description in the service hero. */
  heroTagline?:   { en: string; vi: string };
  faqs:           IFaqItem[];
  highlights:     IHighlightItem[];
  stats:          IStatItem[];
  order:          number; // sort order — lower shows first (gallery tabs, lists)
  projects:       PopulatedDoc<IProject>[];
}

const serviceSchema = new Schema<IService>(
  {
    tag:            { type: String, required: true, unique: true },
    thumbnailImage: { type: String, required: true },
    title:          { type: localizedString, required: true },
    description:    { type: localizedString, required: true },
    heroTagline:    { type: localizedString },
    faqs:           { type: [faqItemSchema], default: [] },
    highlights:     { type: [highlightItemSchema], default: [] },
    stats:          { type: [statItemSchema], default: [] },
    order:          { type: Number, default: 0 },
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
