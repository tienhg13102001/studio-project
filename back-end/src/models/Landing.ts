import mongoose, { Schema, type Document } from "mongoose";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

const socialsSchema = new Schema(
  {
    zalo: String,
    facebook: String,
    instagram: String,
  },
  { _id: false },
);

export interface ILanding extends Document {
  heroLine1: { en: string; vi: string };
  heroLine2: { en: string; vi: string };
  subheading: { en: string; vi: string };
  videoBackground: string;
  phone?: string;
  email?: string;
  address?: { en: string; vi: string };
  socials?: {
    zalo?: string;
    facebook?: string;
    instagram?: string;
  };
}

const landingSchema = new Schema<ILanding>(
  {
    heroLine1: { type: localizedString, required: true },
    heroLine2: { type: localizedString, required: true },
    subheading: { type: localizedString, required: true },
    videoBackground: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    address: { type: localizedString },
    socials: { type: socialsSchema },
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
