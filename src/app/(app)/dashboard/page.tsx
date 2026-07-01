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

      <section className="soft-ring rounded-[32px] border border-line bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.3em] text-muted">Dashboard</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">See the work, not the hype</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Project X keeps your learning record honest by showing completed lessons, tracked time, and the remaining path forward.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {metricLabels.map((metric) => (
          <article key={metric.key} className="soft-ring rounded-[28px] border border-line bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.28em] text-muted">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold">{metricValues[metric.key]}</p>
          </article>
        ))}
      </section>

      <DashboardCharts summary={summary} />
    </div>
  );
}
