"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Expense from "@/models/Expense";
import FixedExpense from "@/models/FixedExpense";
import { revalidatePath } from "next/cache";

export async function addDailyExpense(data: {
  category: string;
  subCategory: string;
  amount: number;
  description?: string;
  date?: string;
}) {
  try {
    await connectToDatabase();
    await Expense.create({
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add expense:", error);
    return { success: false, error: error.message };
  }
}

export async function addFixedExpense(data: {
  monthYear: string;
  category: string;
  amount: number;
  note?: string;
  isExcludedFromTotal?: boolean;
}) {
  try {
    await connectToDatabase();
    await FixedExpense.create({
      ...data,
      isExcludedFromTotal: data.isExcludedFromTotal || false,
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to add fixed expense:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteExpense(id: string) {
  try {
    await connectToDatabase();
    await Expense.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete expense:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteFixedExpense(id: string) {
  try {
    await connectToDatabase();
    await FixedExpense.findByIdAndDelete(id);
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete fixed expense:", error);
    return { success: false, error: error.message };
  }
}

export async function editFixedExpense(id: string, data: {
  category: string;
  amount: number;
  note?: string;
  isExcludedFromTotal?: boolean;
}) {
  try {
    await connectToDatabase();
    await FixedExpense.findByIdAndUpdate(id, {
      ...data,
      isExcludedFromTotal: data.isExcludedFromTotal || false,
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to edit fixed expense:", error);
    return { success: false, error: error.message };
  }
}

export async function markFixedExpensePaid(id: string) {
  try {
    await connectToDatabase();
    await FixedExpense.findByIdAndUpdate(id, {
      isPaid: true,
      paidAt: new Date(),
    });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to mark fixed expense as paid:", error);
    return { success: false, error: error.message };
  }
}

export async function getMonthlyExpenses(monthYear: string) {
  try {
    await connectToDatabase();
    
    // Parse the monthYear (e.g. '2026-09')
    const [year, month] = monthYear.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);

    const dailyExpenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 }).lean();

    const fixedExpenses = await FixedExpense.find({
      monthYear
    }).lean();

    // Convert ObjectIds and Dates to string for client side
    return {
      success: true,
      dailyExpenses: JSON.parse(JSON.stringify(dailyExpenses)),
      fixedExpenses: JSON.parse(JSON.stringify(fixedExpenses))
    };
  } catch (error: any) {
    console.error("Failed to fetch monthly expenses:", error);
    return { success: false, error: error.message };
  }
}
