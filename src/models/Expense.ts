import mongoose, { Schema, model, models } from "mongoose";

const ExpenseSchema = new Schema({
  date: { type: Date, default: Date.now, required: true },
  category: { 
    type: String, 
    enum: ["Food", "Travel", "Groceries", "Miscellaneous"], 
    required: true 
  },
  subCategory: { type: String, default: "" }, // e.g., Lunch, Uber to office
  amount: { type: Number, required: true },
  description: { type: String, default: "" },
}, { timestamps: true });

export default models.Expense || model("Expense", ExpenseSchema);
