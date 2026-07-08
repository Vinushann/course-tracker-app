"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardSummary } from "@/lib/types";

type DashboardChartsProps = {
  summary: DashboardSummary;
};

const pieColors = ["#7cc6a1", "#2a313a"];

export function DashboardCharts({ summary }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <div className="soft-ring rounded-lg border border-line bg-surface p-4">
        <div className="mb-3">
          <h3 className="text-base font-semibold">Completed vs remaining</h3>
          <p className="text-sm text-muted">
            A quick check on overall tracked time.
          </p>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={summary.completedVsRemaining}
                dataKey="hours"
                innerRadius={68}
                outerRadius={92}
              >
                {summary.completedVsRemaining.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={pieColors[index % pieColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="soft-ring rounded-lg border border-line bg-surface p-4 xl:col-span-2">
        <div className="mb-3">
          <h3 className="text-base font-semibold">Last 7 days</h3>
          <p className="text-sm text-muted">
            Minutes completed each day from your activity log.
          </p>
        </div>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.last7Days}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255, 255, 255, 0.06)"
              />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="minutes" fill="#7cc6a1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="soft-ring rounded-lg border border-line bg-surface p-4 xl:col-span-3">
        <div className="mb-3">
          <h3 className="text-base font-semibold">Course progress</h3>
          <p className="text-sm text-muted">Progress percentage by course.</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.courseProgress}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255, 255, 255, 0.06)"
              />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="progress" fill="#7cc6a1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
