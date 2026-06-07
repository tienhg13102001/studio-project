import mongoose, { Schema, type Document } from "mongoose";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

/** Which page a content document drives. One document per page type. */
export type PageType = "landing" | "team";

/**
 * Single content model for editable marketing pages, distinguished by
 * `pageType`. Merges the former `Landing` and `TeamContent` models — each page
 * uses only its own subset of fields. Add a new page by adding a pageType + its
 * fields here (all optional so unrelated pages stay untouched).
 */
export interface IPageContent extends Document {
  pageType: PageType;

  // ── Landing page ──
  heroLine1?:       { en: string; vi: string };
  heroLine2?:       { en: string; vi: string };
  subheading?:      { en: string; vi: string };
  videoBackground?: string;
  /** Single source of truth for phone/email/address/socials lives on Contact. */
  contactId?:       mongoose.Types.ObjectId;

  // ── Team page (Who We Are) ──
  aboutBadge?:       { en: string; vi: string };
  aboutHeading?:     { en: string; vi: string };
  aboutDescription?: { en: string; vi: string };
  aboutImage?:       string;
}

const pageContentSchema = new Schema<IPageContent>(
  {
    pageType:        { type: String, required: true, unique: true, enum: ["landing", "team"] },

    heroLine1:       { type: localizedString },
    heroLine2:       { type: localizedString },
    subheading:      { type: localizedString },
    videoBackground: { type: String },
    contactId:       { type: Schema.Types.ObjectId, ref: "Contact" },

    aboutBadge:       { type: localizedString },
    aboutHeading:     { type: localizedString },
    aboutDescription: { type: localizedString },
    aboutImage:       { type: String },
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

export const PageContent = mongoose.model<IPageContent>("PageContent", pageContentSchema);
