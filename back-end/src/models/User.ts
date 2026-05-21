import mongoose, { Schema, type Document } from "mongoose";
import bcrypt from "bcryptjs";

interface LocalizedString {
  en: string;
  vi: string;
}

export interface IUser extends Document {
  // ── Display ────────────────────────────────────────────────────────────────
  name:     string;
  role:     LocalizedString;
  photo?:   string;
  quote?:   LocalizedString;
  bio?:     LocalizedString;
  skills:   string[];
  featured: boolean;

  // ── Auth ──────────────────────────────────────────────────────────────────
  email:       string;
  password:    string;
  accountRole: "admin" | "member" | "editor";
  active:      boolean;

  // Method
  comparePassword(plain: string): Promise<boolean>;
}

const localizedStringSchema = new Schema<LocalizedString>(
  { en: { type: String, required: true }, vi: { type: String, required: true } },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    // Display
    name:     { type: String, required: true, trim: true },
    role:     { type: localizedStringSchema, required: true },
    photo:    { type: String },
    quote:    { type: localizedStringSchema },
    bio:      { type: localizedStringSchema },
    skills:   { type: [String], default: [] },
    featured: { type: Boolean, default: false },

    // Auth
    email:       { type: String, required: true, unique: true, trim: true, lowercase: true },
    password:    { type: String, required: true, select: false },
    accountRole: { type: String, enum: ["admin", "member", "editor"], default: "member" },
    active:      { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        delete (ret as Record<string, unknown>)["_id"];
        delete (ret as Record<string, unknown>)["password"];
        return ret;
      },
    },
  },
);

// Hash password before save
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare plain password against hash
userSchema.methods.comparePassword = function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

export const User = mongoose.model<IUser>("User", userSchema);
