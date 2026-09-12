"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Coffee, Car, ShoppingCart, LayoutGrid, X, Plus, Calendar } from "lucide-react";
import { addDailyExpense } from "@/app/actions/expenseActions";
import { format } from "date-fns";

const CATEGORIES = [
  { id: "Food", icon: Coffee, color: "bg-orange-500", sub: ["Breakfast", "Lunch", "Dinner", "Snacks"] },
  { id: "Travel", icon: Car, color: "bg-blue-500", sub: ["Cab", "Uber", "Rapido", "Metro"] },
  { id: "Groceries", icon: ShoppingCart, color: "bg-emerald-500", sub: [] },
  { id: "Miscellaneous", icon: LayoutGrid, color: "bg-purple-500", sub: [] },
];

export default function QuickAddDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCat, setSelectedCat] = useState<typeof CATEGORIES[0] | null>(null);
  const [subCat, setSubCat] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when drawer opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const openDrawer = (cat: typeof CATEGORIES[0]) => {
    setSelectedCat(cat);
    setSubCat(cat.sub[0] || "");
    setAmount("");
    setNote("");
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setIsOpen(true);
  };

  const closeDrawer = () => {
    setIsOpen(false);
    setTimeout(() => setSelectedCat(null), 300); // Wait for animation
  };

  const handleAdd = () => {
    if (!selectedCat || !amount) return;

    startTransition(async () => {
      await addDailyExpense({
        category: selectedCat.id,
        subCategory: subCat,
        amount: parseFloat(amount),
        description: note,
        date,
      });
      closeDrawer();
    });
  };

  return (
    <>
      {/* Tray of Category Pills */}
      <div className="py-6 px-4">
        <p className="text-gray-500 text-sm font-semibold mb-4 uppercase tracking-wider pl-2">Quick Add</p>
        <div className="grid grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => openDrawer(cat)}
              className="flex flex-col items-center justify-center space-y-2 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform active:scale-95 group-hover:-translate-y-1 ${cat.color}`}>
                <cat.icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-medium text-gray-700">{cat.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeDrawer}
        />
      )}

      {/* Bottom Sheet Drawer */}
      <div 
        className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl p-6 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-out transform ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {selectedCat && (
          <div className="flex flex-col h-full max-h-[85vh]">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${selectedCat.color}`}>
                  <selectedCat.icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">{selectedCat.id}</h3>
              </div>
              <button onClick={closeDrawer} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Subcategories (if any) */}
            {selectedCat.sub.length > 0 && (
              <div className="flex overflow-x-auto space-x-2 pb-4 mb-2 hide-scrollbar">
                {selectedCat.sub.map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSubCat(sub)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border ${
                      subCat === sub 
                        ? `${selectedCat.color} text-white border-transparent shadow-md` 
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-6 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-gray-400">₹</span>
              <input
                ref={inputRef}
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-3xl font-bold text-gray-800 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Note Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 px-4 text-gray-700 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Date Input */}
            <div className="mb-8 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl py-3 pl-12 pr-4 text-gray-700 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              />
            </div>

            {/* Add Button */}
            <button
              onClick={handleAdd}
              disabled={isPending || !amount || parseFloat(amount) <= 0}
              className={`w-full py-4 rounded-2xl flex items-center justify-center text-lg font-bold text-white transition-all shadow-lg ${
                isPending || !amount || parseFloat(amount) <= 0
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : `${selectedCat.color} hover:opacity-90 active:scale-[0.98]`
              }`}
            >
              {isPending ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Plus className="w-6 h-6 mr-2" />
                  Add {selectedCat.id}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
