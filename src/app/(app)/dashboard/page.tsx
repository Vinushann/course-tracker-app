import Link from "next/link";
import { DashboardCharts } from "@/components/dashboard-charts";
import { getDashboardData } from "@/lib/data";
import { formatMinutes } from "@/lib/utils";

const metricLabels = [
  { key: "totalCourses", label: "Total courses" },
  { key: "totalCompletedLessons", label: "Completed lessons" },
  { key: "totalCompletedMinutes", label: "Completed learning time" },
  { key: "totalRemainingMinutes", label: "Remaining learning time" },
  { key: "todaysCompletedLessons", label: "Today's completed lessons" },
  { key: "overallProgressPercentage", label: "Overall progress" },
] as const;

export default async function DashboardPage() {
  const { summary, setupStatus } = await getDashboardData();

  const metricValues = {
    totalCourses: summary.totalCourses.toString(),
    totalCompletedLessons: summary.totalCompletedLessons.toString(),
    totalCompletedMinutes: formatMinutes(summary.totalCompletedMinutes),
    totalRemainingMinutes: formatMinutes(summary.totalRemainingMinutes),
    todaysCompletedLessons: summary.todaysCompletedLessons.toString(),
    overallProgressPercentage: `${summary.overallProgressPercentage}%`,
  };

  return (
    <div className="space-y-6">
      {!setupStatus.schemaReady ? (
        <section className="soft-ring rounded-[28px] border border-amber-300 bg-amber-50 p-5 text-amber-900">
          <p className="text-xs uppercase tracking-[0.28em]">Setup required</p>
          <h2 className="mt-2 text-2xl font-semibold">Supabase schema is not installed yet</h2>
          <p className="mt-3 text-sm leading-6">
            {setupStatus.message} After running that SQL in the Supabase SQL editor, refresh this page.
          </p>
        </section>
      ) : null}

      <section className="panel-grid soft-ring rounded-[24px] border border-line bg-surface p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Daily focus</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">A quieter view of your learning work</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Check what is done, what is left, and what deserves attention next. Nothing extra.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses?new=1"
              className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-[#0f1412] transition hover:opacity-90"
            >
              Add course
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-strong"
            >
              Review courses
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricLabels.map((metric) => (
          <article key={metric.key} className="soft-ring rounded-[20px] border border-line bg-surface p-5">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight">{metricValues[metric.key]}</p>
          </article>
        ))}
      </section>

      <DashboardCharts summary={summary} />
    </div>
  );
}
