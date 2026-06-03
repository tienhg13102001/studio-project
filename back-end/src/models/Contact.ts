import mongoose, { Schema, type Document } from "mongoose";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

const socialsSchema = new Schema(
  {
    zalo:      { type: String },
    facebook:  { type: String },
    youtube:   { type: String },
    tiktok:    { type: String },
    instagram: { type: String },
  },
  { _id: false },
);

// QR code (PNG data-URL) generated for each social URL. Stored in the DB so it
// persists; regenerated from the portal on demand.
const socialQrsSchema = new Schema(
  {
    zalo:      { type: String },
    facebook:  { type: String },
    youtube:   { type: String },
    tiktok:    { type: String },
    instagram: { type: String },
  },
  { _id: false },
);

const workingHourItemSchema = new Schema(
  {
    label: { type: localizedString, required: true },
    hours: { type: localizedString, required: true },
  },
  { _id: false },
);

export interface IContact extends Document {
  heading:      { en: string; vi: string };
  subheading:   { en: string; vi: string };
  phone:        string;
  email:        string;
  address:      { en: string; vi: string };
  mapUrl:       string;
  workingHours: Array<{ label: { en: string; vi: string }; hours: { en: string; vi: string } }>;
  socials: {
    zalo?:      string;
    facebook?:  string;
    youtube?:   string;
    tiktok?:    string;
    instagram?: string;
  };
  socialQrs?: {
    zalo?:      string;
    facebook?:  string;
    youtube?:   string;
    tiktok?:    string;
    instagram?: string;
  };
}

const contactSchema = new Schema<IContact>(
  {
    heading:    { type: localizedString, required: true },
    subheading: { type: localizedString, required: true },
    phone:      { type: String, required: true },
    email:      { type: String, required: true },
    address:    { type: localizedString, required: true },
    mapUrl:       { type: String, required: true },
    workingHours: { type: [workingHourItemSchema], default: [] },
    socials:      { type: socialsSchema, default: {} },
    socialQrs:    { type: socialQrsSchema, default: {} },
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

export const Contact = mongoose.model<IContact>("Contact", contactSchema);
