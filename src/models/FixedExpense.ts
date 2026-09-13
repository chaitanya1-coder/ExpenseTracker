import mongoose, { Schema, model, models } from "mongoose";

const FixedExpenseSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  monthYear: { type: String, required: true }, // Format: YYYY-MM
  category: { 
    type: String, 
    required: true 
  }, // e.g., Rent, Electricity, Credit Card
  amount: { type: Number, required: true },
  note: { type: String, default: "" },
  isExcludedFromTotal: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
}, { timestamps: true });

export default models.FixedExpense || model("FixedExpense", FixedExpenseSchema);
