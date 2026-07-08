import { CourseManager } from "@/components/course-manager";
import { getCoursesForUser } from "@/lib/data";

type CoursesPageProps = {
  searchParams: Promise<{
    new?: string;
  }>;
};

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const courses = await getCoursesForUser();
  const params = await searchParams;
  const initialShowCreate = params.new === "1";

  return <CourseManager courses={courses} initialShowCreate={initialShowCreate} />;
}
