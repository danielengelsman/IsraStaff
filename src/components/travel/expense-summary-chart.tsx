"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { EXPENSE_TYPES } from "@/lib/utils/constants";
import type { TripExpense } from "@/types/database";

type ExpenseSummaryChartProps = {
  expenses: TripExpense[];
  currency: string;
};

export function ExpenseSummaryChart({ expenses, currency }: ExpenseSummaryChartProps) {
  if (expenses.length === 0) {
    return null;
  }

  const grouped = Object.entries(EXPENSE_TYPES).map(([key, config]) => {
    const total = expenses
      .filter((e) => e.expense_type === key)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      name: config.label,
      value: total,
      color: config.color,
    };
  }).filter((d) => d.value > 0);

  const total = grouped.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-[200px] w-full max-w-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={grouped}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {grouped.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()} ${currency}`, ""]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-lg font-semibold">
        Total: {total.toLocaleString()} {currency}
      </p>
    </div>
  );
}
