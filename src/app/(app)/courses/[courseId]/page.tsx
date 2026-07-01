import Link from "next/link";
import { notFound } from "next/navigation";
import { CourseDetailManager } from "@/components/course-detail-manager";
import { getCourseById } from "@/lib/data";

type CourseDetailPageProps = {
  params: Promise<{
    courseId: string;
  }>;
};

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <Link href="/courses" className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-accent">
        ← Back to courses
      </Link>
      <CourseDetailManager course={course} />
    </div>
  );
}
