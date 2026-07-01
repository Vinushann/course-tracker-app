import { eachDayOfInterval, endOfDay, format, startOfDay, subDays } from "date-fns";
import type { ActivityLog, CourseWithSections, DashboardSummary, Lesson } from "@/lib/types";

export function getLessonsForCourse(course: CourseWithSections) {
  return course.sections.flatMap((section) => section.lessons);
}

export function getCourseProgress(course: CourseWithSections) {
  const lessons = getLessonsForCourse(course);
  const lessonsWithDuration = lessons.filter((lesson) => lesson.duration_minutes > 0);
  const totalMinutesFromLessons = lessonsWithDuration.reduce(
    (sum, lesson) => sum + lesson.duration_minutes,
    0,
  );
  const fallbackMinutes = Math.round((course.target_hours ?? 0) * 60);
  const totalMinutes = totalMinutesFromLessons > 0 ? totalMinutesFromLessons : fallbackMinutes;
  const completedMinutes = lessons.reduce(
    (sum, lesson) => sum + (lesson.completed ? lesson.duration_minutes : 0),
    0,
  );
  const remainingMinutes = Math.max(totalMinutes - completedMinutes, 0);
  const progressPercentage = totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0;
  const completedLessonsCount = lessons.filter((lesson) => lesson.completed).length;

  return {
    totalMinutes,
    completedMinutes,
    remainingMinutes,
    progressPercentage,
    completedLessonsCount,
    totalLessonsCount: lessons.length,
  };
}

export function sortSectionsAndLessons(course: CourseWithSections) {
  const sections = [...course.sections]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((section) => ({
      ...section,
      lessons: [...section.lessons].sort((a, b) => a.sort_order - b.sort_order),
    }));

  return { ...course, sections };
}

export function buildDashboardSummary(courses: CourseWithSections[], activityLogs: ActivityLog[]): DashboardSummary {
  const progressByCourse = courses.map((course) => ({
    course,
    summary: getCourseProgress(course),
  }));

  const totalCourses = courses.length;
  const totalCompletedLessons = progressByCourse.reduce(
    (sum, item) => sum + item.summary.completedLessonsCount,
    0,
  );
  const totalCompletedMinutes = progressByCourse.reduce(
    (sum, item) => sum + item.summary.completedMinutes,
    0,
  );
  const totalRemainingMinutes = progressByCourse.reduce(
    (sum, item) => sum + item.summary.remainingMinutes,
    0,
  );
  const totalTrackedMinutes = totalCompletedMinutes + totalRemainingMinutes;
  const overallProgressPercentage =
    totalTrackedMinutes > 0 ? Math.round((totalCompletedMinutes / totalTrackedMinutes) * 100) : 0;

  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());
  const todaysCompletedLessons = activityLogs.filter((log) => {
    const completedAt = new Date(log.completed_at);
    return completedAt >= todayStart && completedAt <= todayEnd;
  }).length;

  const rangeStart = startOfDay(subDays(new Date(), 6));
  const last7Days = eachDayOfInterval({
    start: rangeStart,
    end: startOfDay(new Date()),
  }).map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const minutes = activityLogs
      .filter((log) => format(new Date(log.completed_at), "yyyy-MM-dd") === key)
      .reduce((sum, log) => sum + log.duration_minutes, 0);

    return {
      day: format(day, "EEE"),
      minutes,
    };
  });

  return {
    totalCourses,
    totalCompletedLessons,
    totalCompletedMinutes,
    totalRemainingMinutes,
    overallProgressPercentage,
    todaysCompletedLessons,
    completedVsRemaining: [
      {
        name: "Completed",
        hours: Number((totalCompletedMinutes / 60).toFixed(1)),
      },
      {
        name: "Remaining",
        hours: Number((totalRemainingMinutes / 60).toFixed(1)),
      },
    ],
    last7Days,
    courseProgress: progressByCourse.map(({ course, summary }) => ({
      name: course.title,
      progress: summary.progressPercentage,
    })),
  };
}

export function getNextSortOrder(items: Array<{ sort_order: number }>) {
  return items.length > 0 ? Math.max(...items.map((item) => item.sort_order)) + 1 : 1;
}

export function getLessonCompletionTimestamp(lesson: Lesson) {
  return lesson.completed_at ? format(new Date(lesson.completed_at), "MMM d, yyyy p") : "Not completed";
}
