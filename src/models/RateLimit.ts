import mongoose, { Schema, model, models } from "mongoose";

const RateLimitSchema = new Schema({
  identifier: { type: String, required: true },
  action: { type: String, required: true }, // e.g., 'login', 'signup'
  count: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, // Documents auto-delete after 1 hour (3600 seconds)
});

// Compound index for efficient querying
RateLimitSchema.index({ identifier: 1, action: 1 });

export default models.RateLimit || model("RateLimit", RateLimitSchema);
