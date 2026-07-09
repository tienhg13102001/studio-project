import mongoose, { Schema, type Document } from "mongoose";

/**
 * Global/shared site settings. This is a singleton — exactly one document
 * exists, keyed by `key: "global"`. Add new global settings fields here.
 */
export interface ISiteSettings extends Document {
  key: string;
  backgroundImage: string; // path or full URL of the global background image
}

const siteSettingsSchema = new Schema<ISiteSettings>(
  {
    key:             { type: String, required: true, unique: true, default: "global" },
    backgroundImage: { type: String, default: "", trim: true },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        const obj = ret as Record<string, unknown>;
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete obj["_id"];
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete obj["key"];
        return ret;
      },
    },
  },
);

export const SiteSettings = mongoose.model<ISiteSettings>("SiteSettings", siteSettingsSchema);
