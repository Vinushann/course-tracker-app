import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseDetailManager } from "@/components/course-detail-manager";
import { getCourseById } from "@/lib/data";

type CourseDetailPageProps = {
  params: Promise<{
    courseId: string;
  }>;
  searchParams: Promise<{
    mode?: string;
  }>;
};

export default async function CourseDetailPage({ params, searchParams }: CourseDetailPageProps) {
  const { courseId } = await params;
  const { mode } = await searchParams;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  const pageMode = mode === "track" ? "track" : "manage";

  return (
    <div className="space-y-4">
      <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent">
        ← Back to courses
      </Link>
      <CourseDetailManager course={course} mode={pageMode} />
    </div>
  );
}
