import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  ListChecks,
  Plus,
  Target,
  TimerReset,
} from "lucide-react";
import { DashboardCharts } from "@/components/dashboard-charts";
import { getDashboardData } from "@/lib/data";
import { formatMinutes } from "@/lib/utils";

const metricLabels = [
  { key: "totalCourses", label: "Total courses", icon: BookOpen },
  {
    key: "totalCompletedLessons",
    label: "Completed lessons",
    icon: CheckCircle2,
  },
  {
    key: "totalCompletedMinutes",
    label: "Completed learning time",
    icon: Clock,
  },
  {
    key: "totalRemainingMinutes",
    label: "Remaining learning time",
    icon: TimerReset,
  },
  {
    key: "todaysCompletedLessons",
    label: "Today's completed lessons",
    icon: Target,
  },
  {
    key: "overallProgressPercentage",
    label: "Overall progress",
    icon: BarChart3,
  },
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
        <section className="soft-ring rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-900">
          <p className="text-xs uppercase tracking-[0.28em]">Setup required</p>
          <h2 className="mt-2 text-2xl font-semibold">
            Supabase schema is not installed yet
          </h2>
          <p className="mt-3 text-sm leading-6">
            {setupStatus.message} After running that SQL in the Supabase SQL
            editor, refresh this page.
          </p>
        </section>
      ) : null}

      <section className="soft-ring rounded-xl border border-line bg-surface p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
              Daily focus
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              A quieter view of your learning work
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Check what is done, what is left, and what deserves attention
              next. Nothing extra.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/courses?new=1"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-[#0f1412] transition hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Add course
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center rounded-lg border border-line px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface-strong"
            >
              <ListChecks className="mr-2 h-4 w-4" aria-hidden />
              Review courses
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricLabels.map((metric) => {
          const Icon = metric.icon;

          return (
            <article
              key={metric.key}
              className="soft-ring rounded-lg border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
                  {metric.label}
                </p>
                <Icon className="h-4 w-4 text-muted" aria-hidden />
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {metricValues[metric.key]}
              </p>
            </article>
          );
        })}
      </section>

      <DashboardCharts summary={summary} />
    </div>
  );
}
