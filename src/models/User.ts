import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for OAuth users
  image: { type: String }, // Optional
}, { timestamps: true });

export default models.User || model("User", UserSchema);
