import mongoose, { Schema, type Document, type PopulatedDoc } from "mongoose";
import type { IService } from "./Service.ts";
import type { IUser } from "./User.ts";

const localizedString = new Schema({ en: String, vi: String }, { _id: false });

export interface IProject extends Document {
  layout: "vertical" | "horizontal";
  service: PopulatedDoc<IService>;
  thumbnailImage: string;
  title: string;
  subtitle: { en: string; vi: string };
  prominent: boolean;
  video?: string; // optional, path to video file
  photos?: string[]; // optional, list of product photo paths
  shootDate?: Date; // optional, date the project was shot
  shootLocation?: string; // optional, Vietnamese province/city where it was shot
  members?: PopulatedDoc<IUser>[]; // optional, references to team members who worked on the project
}

const projectSchema = new Schema<IProject>(
  {
    layout:         { type: String, enum: ["vertical", "horizontal"], required: true },
    service:        { type: Schema.Types.ObjectId, ref: "Service", required: true },
    thumbnailImage: { type: String, required: true },
    title:          { type: String, required: true },
    subtitle:       { type: localizedString, required: true },
    prominent:      { type: Boolean, default: false },
    video:          { type: String, required: false }, // path to video file (optional)
    photos:         { type: [String], required: false }, // array of product photo paths (optional)
    shootDate:      { type: Date, required: false }, // date the project was shot (optional)
    shootLocation:  { type: String, required: false }, // VN province/city (optional)
    members:        [{ type: Schema.Types.ObjectId, ref: "User" }], // team members who worked on the project
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

export const Project = mongoose.model<IProject>("Project", projectSchema);
