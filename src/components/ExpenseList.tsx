"use client";

import { format, isToday, isYesterday } from "date-fns";
import { Coffee, Car, ShoppingCart, LayoutGrid, Trash2 } from "lucide-react";
import { deleteExpense } from "@/app/actions/expenseActions";
import { useTransition } from "react";

interface ExpenseItem {
  _id: string;
  category: string;
  subCategory: string;
  amount: number;
  description: string;
  date: string;
}

interface ExpenseListProps {
  expenses: ExpenseItem[];
}

const CATEGORY_STYLES: Record<string, { icon: any, color: string, bg: string }> = {
  Food: { icon: Coffee, color: "text-orange-500", bg: "bg-orange-100" },
  Travel: { icon: Car, color: "text-blue-500", bg: "bg-blue-100" },
  Groceries: { icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-100" },
  Miscellaneous: { icon: LayoutGrid, color: "text-purple-500", bg: "bg-purple-100" },
};

export default function ExpenseList({ expenses }: ExpenseListProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteExpense(id);
    });
  };

  // Group by date
  const grouped = expenses.reduce((acc, curr) => {
    const dateStr = format(new Date(curr.date), "yyyy-MM-dd");
    if (!acc[dateStr]) acc[dateStr] = { total: 0, items: [] };
    acc[dateStr].total += curr.amount;
    acc[dateStr].items.push(curr);
    return acc;
  }, {} as Record<string, { total: number, items: ExpenseItem[] }>);

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return `Today (${format(date, "d MMM")})`;
    if (isYesterday(date)) return `Yesterday (${format(date, "d MMM")})`;
    return format(date, "EEEE, d MMM");
  };

  return (
    <div className="px-4 pb-24">
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-400 font-medium">No expenses logged this month.</p>
        </div>
      ) : (
        Object.entries(grouped)
          // Sort by date ascending
          .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
          .map(([dateStr, group]) => (
            <div key={dateStr} className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-500 tracking-wide">{getDayLabel(dateStr)}</h4>
                <span className="text-sm font-bold text-gray-800">Total: ₹{group.total.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {group.items.map((item, index) => {
                  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.Miscellaneous;
                  const Icon = style.icon;
                  
                  return (
                    <div key={item._id} className={`flex items-center p-4 ${index !== group.items.length - 1 ? "border-b border-gray-50" : ""}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mr-4 flex-shrink-0 ${style.bg} ${style.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h5 className="font-bold text-gray-800 truncate">
                            {item.category} {item.subCategory && <span className="text-gray-500 font-medium">({item.subCategory})</span>}
                          </h5>
                          <span className="font-bold text-gray-900 ml-2">₹{item.amount.toLocaleString('en-IN')}</span>
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-500 truncate">{item.description}</p>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleDelete(item._id)}
                        disabled={isPending}
                        className="ml-3 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
      )}
    </div>
  );
}
