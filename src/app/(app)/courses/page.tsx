import { CourseManager } from "@/components/course-manager";
import { getCoursesForUser } from "@/lib/data";

export default async function CoursesPage() {
  const courses = await getCoursesForUser();

  return <CourseManager courses={courses} />;
}
