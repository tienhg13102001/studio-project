import mongoose, { Schema, type Document } from "mongoose";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

export interface IService extends Document {
  order: number;
  tag: string;
  iconName: string;
  image: string;
  title: { en: string; vi: string };
  description: { en: string; vi: string };
}

const serviceSchema = new Schema<IService>(
  {
    order: { type: Number, required: true },
    tag: { type: String, required: true, unique: true },
    iconName: { type: String, required: true },
    image: { type: String, required: true },
    title: { type: localizedString, required: true },
    description: { type: localizedString, required: true },
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
