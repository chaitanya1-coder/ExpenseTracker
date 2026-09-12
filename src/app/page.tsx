import MonthlyHeader from "@/components/MonthlyHeader";
import QuickAddDrawer from "@/components/QuickAddDrawer";
import ExpenseList from "@/components/ExpenseList";
import { getMonthlyExpenses } from "@/app/actions/expenseActions";
import { format } from "date-fns";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const currentMonth = typeof resolvedSearchParams.month === 'string' 
    ? resolvedSearchParams.month 
    : format(new Date(), 'yyyy-MM');

  const { success, dailyExpenses = [], fixedExpenses = [], error } = await getMonthlyExpenses(currentMonth);

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
      <MonthlyHeader 
        currentMonth={currentMonth}
        totalSpend={totalSpend}
        dailyTotal={dailyTotal}
        fixedTotal={fixedTotal}
        fixedExpenses={fixedExpenses}
        dailyExpenses={dailyExpenses}
      />
      
      <QuickAddDrawer />
      <div className="relative z-0 -mt-4 bg-[#F8F9FA] rounded-t-3xl pt-6">
        <div className="mt-2">
          <ExpenseList expenses={dailyExpenses} />
        </div>
      </div>
    </main>
  );
}
