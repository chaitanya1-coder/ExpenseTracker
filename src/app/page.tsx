import MonthlyHeader from "@/components/MonthlyHeader";
import QuickAddDrawer from "@/components/QuickAddDrawer";
import ExpenseList from "@/components/ExpenseList";
import AuthModal from "@/components/AuthModal";
import { getMonthlyExpenses } from "@/app/actions/expenseActions";
import { format } from "date-fns";
import { auth } from "@/auth";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const currentMonth = typeof resolvedSearchParams.month === 'string' 
    ? resolvedSearchParams.month 
    : format(new Date(), 'yyyy-MM');

  let dailyExpenses = [];
  let fixedExpenses = [];
  let success = true;
  let error = "";

  if (session) {
    const res = await getMonthlyExpenses(currentMonth);
    success = res.success;
    dailyExpenses = res.dailyExpenses || [];
    fixedExpenses = res.fixedExpenses || [];
    error = res.error || "";
  } else {
    // Generate fake data for unauthenticated view
    dailyExpenses = [
      { _id: '1', date: new Date().toISOString(), category: 'Food', subCategory: 'Lunch', amount: 150, description: '' },
      { _id: '2', date: new Date().toISOString(), category: 'Travel', subCategory: 'Uber', amount: 350, description: '' },
      { _id: '3', date: new Date(Date.now() - 86400000).toISOString(), category: 'Groceries', subCategory: 'Supermarket', amount: 800, description: '' }
    ];
    fixedExpenses = [
      { _id: 'f1', monthYear: currentMonth, category: 'Rent', amount: 15000, isExcludedFromTotal: false, isPaid: true, paidAt: new Date().toISOString() },
      { _id: 'f2', monthYear: currentMonth, category: 'Internet', amount: 1000, isExcludedFromTotal: false, isPaid: false }
    ];
  }

  if (!success) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-red-50 text-red-500 p-6 rounded-3xl">
          <h2 className="text-lg font-bold mb-2">Failed to load data</h2>
          <p className="text-sm">Please check your MongoDB connection.</p>
          {error && <p className="text-xs mt-2 opacity-80">{error}</p>}
        </div>
      </div>
    );
  }

  const dailyTotal = dailyExpenses.reduce((acc: number, exp: any) => acc + exp.amount, 0);
  const fixedTotal = fixedExpenses.reduce((acc: number, exp: any) => exp.isExcludedFromTotal ? acc : acc + exp.amount, 0);
  const totalSpend = dailyTotal + fixedTotal;

  return (
    <main className="min-h-screen bg-[#F8F9FA] max-w-md mx-auto relative shadow-2xl overflow-x-hidden">
      {!session && <AuthModal />}
      
      <div className={!session ? "pointer-events-none opacity-50 blur-sm transition-all" : ""}>
        <MonthlyHeader 
          currentMonth={currentMonth}
          totalSpend={totalSpend}
          dailyTotal={dailyTotal}
          fixedTotal={fixedTotal}
          fixedExpenses={fixedExpenses}
          dailyExpenses={dailyExpenses}
        />
        
        {session && <QuickAddDrawer />}
        <div className="relative z-0 -mt-4 bg-[#F8F9FA] rounded-t-3xl pt-6">
          <div className="mt-2">
            <ExpenseList expenses={dailyExpenses} />
          </div>
        </div>
      </div>
    </main>
  );
}
