"use client";

import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Plus, X, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { markFixedExpensePaid, addFixedExpense, editFixedExpense, deleteFixedExpense } from "@/app/actions/expenseActions";
import { format, parse, subMonths, addMonths } from "date-fns";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface FixedExpense {
  _id: string;
  category: string;
  amount: number;
  note?: string;
  isExcludedFromTotal?: boolean;
  isPaid: boolean;
}

interface MonthlyHeaderProps {
  currentMonth: string; // YYYY-MM
  totalSpend: number;
  dailyTotal: number;
  fixedTotal: number;
  fixedExpenses: FixedExpense[];
  dailyExpenses?: any[];
}

const FIXED_CATEGORIES = ["Rent", "Electricity", "Water Bill", "Credit Card", "Internet", "Other"];

export default function MonthlyHeader({
  currentMonth,
  totalSpend,
  dailyTotal,
  fixedTotal,
  fixedExpenses,
  dailyExpenses,
}: MonthlyHeaderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAmountVisible, setIsAmountVisible] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [category, setCategory] = useState("Rent");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isExcluded, setIsExcluded] = useState(false);

  const openAddModal = () => {
    setEditId(null);
    setCategory("Rent");
    setAmount("");
    setNote("");
    setIsExcluded(false);
    setIsModalOpen(true);
  };

  const openEditModal = (expense: FixedExpense) => {
    setEditId(expense._id);
    setCategory(expense.category);
    setAmount(expense.amount.toString());
    setNote(expense.note || "");
    setIsExcluded(expense.isExcludedFromTotal || false);
    setIsModalOpen(true);
  };

  // Auto-select excluded for Credit Card
  const handleCategoryChange = (val: string) => {
    setCategory(val);
    if (val === "Credit Card") {
      setIsExcluded(true);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const currentDate = parse(currentMonth, 'yyyy-MM', new Date());
    const newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    const newMonth = format(newDate, 'yyyy-MM');
    router.push(`/?month=${newMonth}`);
  };

  const handleMarkPaid = async (id: string) => {
    startTransition(async () => {
      await markFixedExpensePaid(id);
    });
  };

  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await deleteFixedExpense(id);
    });
  };

  const handleSave = () => {
    if (!amount) return;
    startTransition(async () => {
      if (editId) {
        await editFixedExpense(editId, {
          category,
          amount: parseFloat(amount),
          note,
          isExcludedFromTotal: isExcluded
        });
      } else {
        await addFixedExpense({
          monthYear: currentMonth,
          category,
          amount: parseFloat(amount),
          note,
          isExcludedFromTotal: isExcluded
        });
      }
      setIsModalOpen(false);
    });
  };

  const formattedMonth = format(parse(currentMonth, 'yyyy-MM', new Date()), 'MMMM yyyy');

  // Calculate daily category totals for the donut chart
  const categoryTotals = (dailyExpenses || []).reduce((acc: any, exp: any) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const CAT_COLORS: Record<string, string> = {
    Food: "#f97316", // orange-500
    Travel: "#3b82f6", // blue-500
    Groceries: "#10b981", // emerald-500
    Miscellaneous: "#a855f7", // purple-500
  };

  // Generate conic gradient string
  let cumulativePercent = 0;
  const gradientStops = Object.entries(categoryTotals)
    .filter(([_, amount]) => (amount as number) > 0)
    .map(([cat, amount]) => {
      const percentage = ((amount as number) / (dailyTotal || 1)) * 100;
      const start = cumulativePercent;
      cumulativePercent += percentage;
      return `${CAT_COLORS[cat] || "#9ca3af"} ${start}% ${cumulativePercent}%`;
    })
    .join(", ");

  const conicGradient = gradientStops ? `conic-gradient(${gradientStops})` : "conic-gradient(#4b5563 0% 100%)";

  return (
    <div className="bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 text-white p-6 rounded-b-3xl shadow-2xl relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-purple-500 opacity-20 blur-3xl mix-blend-screen"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen"></div>
      
      {/* Month Picker */}
      <div className="flex justify-between items-center mb-8 relative z-10">
        <button 
          onClick={() => handleMonthChange('prev')} 
          disabled={currentMonth === '2026-09'}
          className={`p-2 rounded-full transition-colors backdrop-blur-sm ${
            currentMonth === '2026-09' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-xs font-medium text-indigo-200 tracking-wider mb-1 uppercase">Chaitanya's Expenses</span>
          <h2 className="text-xl font-bold tracking-wide">{formattedMonth}</h2>
        </div>
        <button 
          onClick={() => handleMonthChange('next')} 
          className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-sm"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Hero Metric Card */}
      <div className="mb-6 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Total Month Spend</p>
          <button onClick={() => setIsAmountVisible(!isAmountVisible)} className="text-indigo-300 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10">
            {isAmountVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
        </div>
        <div className={`text-5xl font-extrabold mb-4 flex items-baseline transition-all duration-300 ${!isAmountVisible ? 'blur-md opacity-50 select-none' : ''}`}>
          <span className="text-3xl mr-1 opacity-80">₹</span>
          {totalSpend.toLocaleString('en-IN')}
        </div>
        
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-indigo-200 text-xs mb-1 uppercase tracking-wider">Daily</span>
            <span className="font-semibold text-lg">₹{dailyTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col items-center justify-center">
            <span className="text-indigo-200 text-xs mb-1 uppercase tracking-wider">Fixed</span>
            <span className="font-semibold text-lg">₹{fixedTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Donut */}
      {dailyTotal > 0 && (
        <div className="mb-6 relative z-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-5 shadow-inner">
          <p className="text-indigo-200 text-xs font-medium mb-4 uppercase tracking-wider">Category Breakdown</p>
          <div className="flex items-center gap-6">
            {/* Pie Chart */}
            <div className="relative w-24 h-24 flex-shrink-0 rounded-full shadow-lg" style={{ background: conicGradient }}>
            </div>
            
            {/* Legend */}
            <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-2">
              {Object.entries(categoryTotals)
                .filter(([_, amount]) => (amount as number) > 0)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex flex-col">
                    <div className="flex items-center space-x-1.5 mb-0.5">
                      <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: CAT_COLORS[cat] || "#9ca3af" }}></div>
                      <span className="text-xs text-indigo-100 truncate pr-1">{cat}</span>
                    </div>
                    <span className="text-sm font-bold pl-4 text-white">₹{(amount as number).toLocaleString('en-IN')}</span>
                  </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Fixed Bills */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-3">
          <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Fixed Bills</p>
          <button onClick={openAddModal} className="p-1 rounded bg-white/10 hover:bg-white/20 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        
        <div className="flex flex-col space-y-3 pb-2">
          {fixedExpenses.length === 0 ? (
            <div className="text-sm text-indigo-300 italic">No fixed bills for this month.</div>
          ) : (
            fixedExpenses.map((expense) => (
              <div
                key={expense._id}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl border transition-all duration-300 ${
                  expense.isPaid
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-100"
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 shadow-lg backdrop-blur-md"
                }`}
              >
                <button 
                  onClick={() => !expense.isPaid && handleMarkPaid(expense._id)}
                  disabled={expense.isPaid || isPending}
                  className="flex items-center text-left focus:outline-none flex-1"
                >
                  {expense.isPaid ? (
                    <CheckCircle2 className="w-5 h-5 mr-3.5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 mr-3.5 text-indigo-300 hover:text-white transition-colors flex-shrink-0" />
                  )}
                  <div className="flex flex-col items-start flex-1 min-w-0 pr-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm font-semibold leading-tight truncate">{expense.category}</span>
                      <div className="flex items-center space-x-2 pl-2">
                         {expense.isExcludedFromTotal && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">Excl.</span>}
                         <span className="text-base font-bold leading-tight">₹{expense.amount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    {expense.note && <span className="text-xs text-indigo-200 leading-tight truncate w-full mt-1">{expense.note}</span>}
                  </div>
                </button>

                <div className="flex items-center ml-2 space-x-1 border-l border-white/20 pl-3">
                  <button onClick={() => openEditModal(expense)} className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors" disabled={isPending}>
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(expense._id)} className="p-2 text-indigo-200 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors" disabled={isPending}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Fixed Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-gray-900 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-gray-800">{editId ? "Edit Fixed Bill" : "Add Fixed Bill"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {FIXED_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleCategoryChange(cat)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
                        category === cat 
                          ? "bg-indigo-600 text-white border-indigo-600" 
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 pl-10 pr-4 font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Card"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <label className="flex items-center space-x-3 cursor-pointer mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <input 
                  type="checkbox" 
                  checked={isExcluded}
                  onChange={(e) => setIsExcluded(e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Exclude from Total Spend (e.g. Credit Card)</span>
              </label>

              <button
                onClick={handleSave}
                disabled={isPending || !amount || parseFloat(amount) <= 0}
                className="w-full mt-4 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:bg-gray-300 transition-colors flex justify-center items-center"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Save Bill"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
