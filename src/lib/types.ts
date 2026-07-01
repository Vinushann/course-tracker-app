export type Course = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string | null;
  target_hours: number | null;
  created_at: string;
  updated_at: string;
};

export type Section = {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Lesson = {
  id: string;
  user_id: string;
  course_id: string;
  section_id: string;
  title: string;
  duration_minutes: number;
  video_url: string | null;
  completed: boolean;
  completed_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  course_id: string;
  section_id: string;
  lesson_id: string;
  duration_minutes: number;
  completed_at: string;
  created_at: string;
};

export type SectionWithLessons = Section & {
  lessons: Lesson[];
};

export type CourseWithSections = Course & {
  sections: SectionWithLessons[];
};

export type CourseProgressSummary = {
  totalMinutes: number;
  completedMinutes: number;
  remainingMinutes: number;
  progressPercentage: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
};

export type DashboardSummary = {
  totalCourses: number;
  totalCompletedLessons: number;
  totalCompletedMinutes: number;
  totalRemainingMinutes: number;
  overallProgressPercentage: number;
  todaysCompletedLessons: number;
  completedVsRemaining: Array<{
    name: string;
    hours: number;
  }>;
  last7Days: Array<{
    day: string;
    minutes: number;
  }>;
  courseProgress: Array<{
    name: string;
    progress: number;
  }>;
};

export type SetupStatus = {
  schemaReady: boolean;
  message?: string;
};
