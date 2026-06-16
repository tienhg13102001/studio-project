import mongoose, { Schema, type Document } from "mongoose";

export interface IPortfolioItem extends Document {
  image: string; // path or URL to the portfolio image
  title: string; // optional caption / alt text
  order: number;
  active: boolean;
}

const portfolioItemSchema = new Schema<IPortfolioItem>(
  {
    image: { type: String, required: true },
    title: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>)["_id"];
        return ret;
      },
    },
  },
);

export const PortfolioItem = mongoose.model<IPortfolioItem>("PortfolioItem", portfolioItemSchema);
