import mongoose, { Schema, type Document } from "mongoose";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

export interface ILanding extends Document {
  heroLine1: { en: string; vi: string };
  heroLine2: { en: string; vi: string };
  subheading: { en: string; vi: string };
  videoBackground: string;
  /** Reference to the Contact document — single source of truth for phone/email/address/socials. */
  contactId?: mongoose.Types.ObjectId;
}

const landingSchema = new Schema<ILanding>(
  {
    heroLine1: { type: localizedString, required: true },
    heroLine2: { type: localizedString, required: true },
    subheading: { type: localizedString, required: true },
    videoBackground: { type: String, required: true },
    contactId: { type: Schema.Types.ObjectId, ref: "Contact" },
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

export const Landing = mongoose.model<ILanding>("Landing", landingSchema);
