"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfToday,
  endOfWeek,
  format,
  isWithinInterval,
  parseISO,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subDays,
} from "date-fns";
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
import type { ActivityLog, CourseWithSections, DashboardSummary } from "@/lib/types";
import { formatDate, formatMinutes } from "@/lib/utils";

type DashboardChartsProps = {
  activityLogs: ActivityLog[];
  courses: CourseWithSections[];
  summary: DashboardSummary;
};

type FilterMode = "all" | "today" | "week" | "month" | "date" | "month-picker";

const pieColors = ["#7cc6a1", "#2a313a"];

function buildLessonLookup(courses: CourseWithSections[]) {
  const lessonMap = new Map<
    string,
    {
      courseTitle: string;
      sectionTitle: string;
      lessonTitle: string;
    }
  >();

  courses.forEach((course) => {
    course.sections.forEach((section) => {
      section.lessons.forEach((lesson) => {
        lessonMap.set(lesson.id, {
          courseTitle: course.title,
          sectionTitle: section.title,
          lessonTitle: lesson.title,
        });
      });
    });
  });

  return lessonMap;
}

function normalizeDateRange(mode: FilterMode, selectedDate: string, selectedMonth: string) {
  const now = new Date();

  switch (mode) {
    case "today":
      return {
        start: startOfToday(),
        end: endOfToday(),
        label: "Today",
        chartTitle: "Today",
      };
    case "week":
      return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 }),
        label: "This week",
        chartTitle: "This week",
      };
    case "month":
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: "This month",
        chartTitle: format(now, "MMMM yyyy"),
      };
    case "date": {
      const date = parseISO(selectedDate);
      return {
        start: new Date(date.setHours(0, 0, 0, 0)),
        end: new Date(date.setHours(23, 59, 59, 999)),
        label: format(date, "MMM d, yyyy"),
        chartTitle: format(date, "MMM d, yyyy"),
      };
    }
    case "month-picker": {
      const monthDate = parseISO(`${selectedMonth}-01`);
      return {
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate),
        label: format(monthDate, "MMMM yyyy"),
        chartTitle: format(monthDate, "MMMM yyyy"),
      };
    }
    case "all":
    default:
      return null;
  }
}

export function DashboardCharts({ activityLogs, courses, summary }: DashboardChartsProps) {
  const today = new Date();
  const [mode, setMode] = useState<FilterMode>("week");
  const [selectedDate, setSelectedDate] = useState(format(today, "yyyy-MM-dd"));
  const [selectedMonth, setSelectedMonth] = useState(format(today, "yyyy-MM"));

  const lessonLookup = useMemo(() => buildLessonLookup(courses), [courses]);
  const range = useMemo(() => normalizeDateRange(mode, selectedDate, selectedMonth), [mode, selectedDate, selectedMonth]);

  const filteredLogs = useMemo(() => {
    if (!range) {
      return activityLogs;
    }

    return activityLogs.filter((log) => {
      const completedAt = new Date(log.completed_at);
      return isWithinInterval(completedAt, {
        start: range.start,
        end: range.end,
      });
    });
  }, [activityLogs, range]);

  const activitySeries = useMemo(() => {
    if (filteredLogs.length === 0) {
      if (!range) {
        return eachDayOfInterval({
          start: subDays(startOfToday(), 6),
          end: startOfToday(),
        }).map((day) => ({
          day: format(day, "MMM d"),
          minutes: 0,
        }));
      }

      return eachDayOfInterval({
        start: range.start,
        end: range.end,
      }).map((day) => ({
        day: format(day, "MMM d"),
        minutes: 0,
      }));
    }

    const seriesRange = range
      ? { start: range.start, end: range.end }
      : {
          start: subDays(startOfToday(), 29),
          end: endOfToday(),
        };

    return eachDayOfInterval(seriesRange).map((day) => {
      const dayKey = format(day, "yyyy-MM-dd");
      const minutes = filteredLogs
        .filter((log) => format(new Date(log.completed_at), "yyyy-MM-dd") === dayKey)
        .reduce((sum, log) => sum + log.duration_minutes, 0);

      return {
        day: format(day, "MMM d"),
        minutes,
      };
    });
  }, [filteredLogs, range]);

  const courseBreakdown = useMemo(() => {
    const totals = new Map<string, number>();

    filteredLogs.forEach((log) => {
      const lookup = lessonLookup.get(log.lesson_id);
      const courseTitle = lookup?.courseTitle ?? "Unknown course";
      totals.set(courseTitle, (totals.get(courseTitle) ?? 0) + log.duration_minutes);
    });

    return [...totals.entries()]
      .map(([name, minutes]) => ({
        name,
        minutes,
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6);
  }, [filteredLogs, lessonLookup]);

  const periodSnapshot = useMemo(() => {
    const totalMinutes = filteredLogs.reduce((sum, log) => sum + log.duration_minutes, 0);
    const completedLessons = filteredLogs.length;
    const activeDays = new Set(filteredLogs.map((log) => format(new Date(log.completed_at), "yyyy-MM-dd"))).size;
    const coursesTouched = new Set(
      filteredLogs.map((log) => lessonLookup.get(log.lesson_id)?.courseTitle ?? log.course_id),
    ).size;
    const topCourse = courseBreakdown[0];

    return {
      label: range?.label ?? "All time",
      totalMinutes,
      completedLessons,
      activeDays,
      coursesTouched,
      topCourseName: topCourse?.name ?? "Nothing yet",
      topCourseMinutes: topCourse?.minutes ?? 0,
    };
  }, [courseBreakdown, filteredLogs, lessonLookup, range]);

  const recentActivity = useMemo(() => {
    return [...filteredLogs]
      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
      .slice(0, 8)
      .map((log) => {
        const lookup = lessonLookup.get(log.lesson_id);

        return {
          id: log.id,
          completedAt: log.completed_at,
          courseTitle: lookup?.courseTitle ?? "Unknown course",
          sectionTitle: lookup?.sectionTitle ?? "Unknown section",
          lessonTitle: lookup?.lessonTitle ?? "Unknown lesson",
          durationMinutes: log.duration_minutes,
        };
      });
  }, [filteredLogs, lessonLookup]);

  const allTimeSnapshot = useMemo(() => {
    const activeDays = new Set(activityLogs.map((log) => format(new Date(log.completed_at), "yyyy-MM-dd"))).size;

    return {
      totalCourses: summary.totalCourses,
      completedLessons: summary.totalCompletedLessons,
      completedTime: summary.totalCompletedMinutes,
      remainingTime: summary.totalRemainingMinutes,
      progress: summary.overallProgressPercentage,
      activeDays,
    };
  }, [activityLogs, summary]);

  return (
    <div className="space-y-5">
      <section className="soft-ring rounded-[24px] border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All time" },
              { key: "today", label: "Today" },
              { key: "week", label: "This week" },
              { key: "month", label: "This month" },
            ].map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setMode(option.key as FilterMode)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  mode === option.key
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-line text-muted hover:bg-surface-strong hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => {
                setSelectedDate(event.target.value);
                setMode("date");
              }}
              className="rounded-full border border-line bg-surface-strong px-4 py-2 text-sm text-foreground outline-none"
            />
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => {
                setSelectedMonth(event.target.value);
                setMode("month-picker");
              }}
              className="rounded-full border border-line bg-surface-strong px-4 py-2 text-sm text-foreground outline-none"
            />
          </div>

          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">Dashboard</p>
            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{periodSnapshot.label} at a glance</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
                  See what you finished in the selected time window, where the effort went, and what needs attention next.
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
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <article className="rounded-[18px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Lessons completed</p>
              <p className="mt-3 text-xl font-semibold">{periodSnapshot.completedLessons}</p>
            </article>
            <article className="rounded-[18px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Completed time</p>
              <p className="mt-3 text-xl font-semibold">{formatMinutes(periodSnapshot.totalMinutes)}</p>
            </article>
            <article className="rounded-[18px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Active days</p>
              <p className="mt-3 text-xl font-semibold">{periodSnapshot.activeDays}</p>
            </article>
            <article className="rounded-[18px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Courses touched</p>
              <p className="mt-3 text-xl font-semibold">{periodSnapshot.coursesTouched}</p>
            </article>
            <article className="rounded-[18px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Top course</p>
              <p className="mt-3 text-base font-semibold">{periodSnapshot.topCourseName}</p>
              <p className="mt-1 text-sm text-muted">{formatMinutes(periodSnapshot.topCourseMinutes)}</p>
            </article>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-3">
        <section className="soft-ring rounded-[20px] border border-line bg-surface p-5 xl:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Selected range</p>
              <h3 className="mt-2 text-2xl font-semibold">{periodSnapshot.label}</h3>
              <p className="mt-2 text-sm text-muted">
                {periodSnapshot.completedLessons > 0
                  ? `You finished ${periodSnapshot.completedLessons} lessons for ${formatMinutes(periodSnapshot.totalMinutes)} in this period.`
                  : "No lessons marked complete in this period yet."}
              </p>
            </div>
            <div className="rounded-[18px] border border-line bg-surface-strong/70 px-4 py-3 text-sm text-muted">
              {range ? `Focused view: ${range.chartTitle}` : "Focused view: all available activity"}
            </div>
          </div>
        </section>

        <section className="soft-ring rounded-[20px] border border-line bg-surface p-5">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">All-time baseline</p>
            <h3 className="mt-2 text-2xl font-semibold">{allTimeSnapshot.progress}% complete</h3>
            <p className="mt-2 text-sm text-muted">
              {allTimeSnapshot.completedLessons} lessons done across {allTimeSnapshot.totalCourses} courses.
            </p>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <article className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Completed time</p>
              <p className="mt-2 text-xl font-semibold">{formatMinutes(allTimeSnapshot.completedTime)}</p>
            </article>
            <article className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Remaining time</p>
              <p className="mt-2 text-xl font-semibold">{formatMinutes(allTimeSnapshot.remainingTime)}</p>
            </article>
            <article className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Today completed</p>
              <p className="mt-2 text-xl font-semibold">{summary.todaysCompletedLessons}</p>
            </article>
            <article className="rounded-[16px] border border-line bg-surface-strong/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-muted">Active days</p>
              <p className="mt-2 text-xl font-semibold">{allTimeSnapshot.activeDays}</p>
            </article>
          </div>
        </section>

        <div className="soft-ring rounded-[20px] border border-line bg-surface p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Completed vs remaining</h3>
            <p className="text-sm text-muted">Your all-time balance, kept nearby for context.</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={summary.completedVsRemaining} dataKey="hours" innerRadius={68} outerRadius={92}>
                  {summary.completedVsRemaining.map((entry, index) => (
                    <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="soft-ring rounded-[20px] border border-line bg-surface p-5 xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Completed time by day</h3>
            <p className="text-sm text-muted">
              {range ? `Minutes completed during ${range.chartTitle}.` : "Minutes completed over your recent 30 days."}
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activitySeries}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#7cc6a1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="soft-ring rounded-[20px] border border-line bg-surface p-5 xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Course contribution</h3>
            <p className="text-sm text-muted">Which courses got your time in the selected period.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#7cc6a1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="soft-ring rounded-[20px] border border-line bg-surface p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Recent activity</h3>
            <p className="text-sm text-muted">The latest lessons you marked complete in this view.</p>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => (
                <article key={item.id} className="rounded-[16px] border border-line bg-surface-strong/60 p-4">
                  <p className="text-sm font-semibold">{item.lessonTitle}</p>
                  <p className="mt-1 text-sm text-muted">
                    {item.courseTitle} · {item.sectionTitle}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
                    {formatDate(item.completedAt)} · {formatMinutes(item.durationMinutes)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-line px-4 py-8 text-sm text-muted">
                No completed lessons in this period yet.
              </div>
            )}
          </div>
        </div>

        <div className="soft-ring rounded-[20px] border border-line bg-surface p-5 xl:col-span-3">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Course progress</h3>
            <p className="text-sm text-muted">Overall progress percentage by course.</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary.courseProgress}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.06)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="progress" fill="#7cc6a1" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
