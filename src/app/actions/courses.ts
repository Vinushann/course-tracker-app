"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile, getCourseById } from "@/lib/data";
import { getNextSortOrder } from "@/lib/progress";
import type { CourseBlueprintSectionInput } from "@/lib/types";
import {
  isValidUrl,
  parseDurationMinutesFromFields,
  parseOptionalNumber,
  parseRequiredNumber,
  parseText,
} from "@/lib/utils";

async function getSessionContext() {
  const supabase = await createClient();
  const user = await ensureProfile();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

function revalidateLearningPaths(courseId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/courses");
  if (courseId) {
    revalidatePath(`/courses/${courseId}`);
  }
}

function buildDefaultCourseBlueprint(sectionCount = 1, lessonCount = 1) {
  return Array.from({ length: sectionCount }, (_, sectionIndex) => ({
    title: `Sub section ${sectionIndex + 1}`,
    lessons: Array.from({ length: lessonCount }, (_, lessonIndex) => ({
      title: `Lesson ${lessonIndex + 1}`,
      duration_minutes: 0,
      video_url: null,
    })),
  }));
}

function parseCourseBlueprint(formData: FormData) {
  const rawBlueprint = formData.get("course_blueprint")?.toString();

  if (!rawBlueprint) {
    return buildDefaultCourseBlueprint();
  }

  try {
    const parsed = JSON.parse(rawBlueprint) as CourseBlueprintSectionInput[];

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return buildDefaultCourseBlueprint();
    }

    return parsed.map((section, sectionIndex) => ({
      title: section.title?.trim() || `Sub section ${sectionIndex + 1}`,
      lessons:
        Array.isArray(section.lessons) && section.lessons.length > 0
          ? section.lessons.map((lesson, lessonIndex) => {
              const videoUrl = lesson.video_url?.trim() || null;

              if (!isValidUrl(videoUrl)) {
                throw new Error("Lesson video URLs must use http or https.");
              }

              return {
                title: lesson.title?.trim() || `Lesson ${lessonIndex + 1}`,
                duration_minutes: Number.isFinite(Number(lesson.duration_minutes))
                  ? Math.max(0, Number(lesson.duration_minutes))
                  : 0,
                video_url: videoUrl,
              };
            })
          : buildDefaultCourseBlueprint(1, 1)[0].lessons,
    }));
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Course structure could not be parsed.");
  }
}

export async function createCourseAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const courseBlueprint = parseCourseBlueprint(formData);

  const payload = {
    user_id: user.id,
    title: formData.get("title")?.toString().trim() || "Untitled course",
    description: parseText(formData.get("description")),
    target_hours: parseOptionalNumber(formData.get("target_hours")),
  };

  const { data: createdCourse, error: courseError } = await supabase
    .from("courses")
    .insert(payload)
    .select("id")
    .single();

  if (courseError || !createdCourse) {
    throw courseError ?? new Error("Course could not be created.");
  }

  const sectionRows = courseBlueprint.map((section, index) => ({
    user_id: user.id,
    course_id: createdCourse.id,
    title: section.title,
    sort_order: index + 1,
  }));

  const { data: createdSections, error: sectionError } = await supabase
    .from("sections")
    .insert(sectionRows)
    .select("id, sort_order");

  if (sectionError || !createdSections) {
    throw sectionError ?? new Error("Sections could not be created.");
  }

  const lessonsPayload = createdSections.flatMap((sectionRow) => {
    const sourceSection = courseBlueprint.find((section, index) => index + 1 === sectionRow.sort_order);

    return (sourceSection?.lessons ?? []).map((lesson, lessonIndex) => ({
      user_id: user.id,
      course_id: createdCourse.id,
      section_id: sectionRow.id,
      title: lesson.title,
      duration_minutes: lesson.duration_minutes,
      video_url: lesson.video_url,
      sort_order: lessonIndex + 1,
    }));
  });

  if (lessonsPayload.length > 0) {
    const { error: lessonError } = await supabase.from("lessons").insert(lessonsPayload);

    if (lessonError) {
      throw lessonError;
    }
  }

  revalidateLearningPaths();
}

export async function updateCourseAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const courseId = formData.get("course_id")?.toString() ?? "";

  const { error } = await supabase
    .from("courses")
    .update({
      title: formData.get("title")?.toString().trim() || "Untitled course",
      description: parseText(formData.get("description")),
      target_hours: parseOptionalNumber(formData.get("target_hours")),
    })
    .eq("id", courseId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  revalidateLearningPaths(courseId);
}

export async function deleteCourseAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const courseId = formData.get("course_id")?.toString() ?? "";

  const { error } = await supabase.from("courses").delete().eq("id", courseId).eq("user_id", user.id);
  if (error) {
    throw error;
  }

  revalidateLearningPaths(courseId);
}

export async function createSectionAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const courseId = formData.get("course_id")?.toString() ?? "";
  const course = await getCourseById(courseId);

  if (!course) {
    return;
  }

  const { error } = await supabase.from("sections").insert({
    user_id: user.id,
    course_id: courseId,
    title: formData.get("title")?.toString().trim() || "New section",
    sort_order: getNextSortOrder(course.sections),
  });

  if (error) {
    throw error;
  }

  revalidateLearningPaths(courseId);
}

export async function updateSectionAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const sectionId = formData.get("section_id")?.toString() ?? "";
  const courseId = formData.get("course_id")?.toString() ?? "";

  const { error } = await supabase
    .from("sections")
    .update({
      title: formData.get("title")?.toString().trim() || "Untitled section",
      sort_order: parseRequiredNumber(formData.get("sort_order")),
    })
    .eq("id", sectionId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  revalidateLearningPaths(courseId);
}

export async function deleteSectionAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const sectionId = formData.get("section_id")?.toString() ?? "";
  const courseId = formData.get("course_id")?.toString() ?? "";

  const { error } = await supabase.from("sections").delete().eq("id", sectionId).eq("user_id", user.id);
  if (error) {
    throw error;
  }

  revalidateLearningPaths(courseId);
}

export async function createLessonAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const courseId = formData.get("course_id")?.toString() ?? "";
  const sectionId = formData.get("section_id")?.toString() ?? "";
  const course = await getCourseById(courseId);

  if (!course) {
    return;
  }

  const section = course.sections.find((item) => item.id === sectionId);
  const videoUrl = parseText(formData.get("video_url"));

  if (!isValidUrl(videoUrl)) {
    throw new Error("Lesson video URLs must use http or https.");
  }

  const { error } = await supabase.from("lessons").insert({
    user_id: user.id,
    course_id: courseId,
    section_id: sectionId,
    title: formData.get("title")?.toString().trim() || "Untitled lesson",
    duration_minutes: parseDurationMinutesFromFields(
      formData.get("duration_hours"),
      formData.get("duration_minutes"),
    ),
    video_url: videoUrl,
    sort_order: getNextSortOrder(section?.lessons ?? []),
  });

  if (error) {
    throw error;
  }

  revalidateLearningPaths(courseId);
}

export async function updateLessonAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const lessonId = formData.get("lesson_id")?.toString() ?? "";
  const courseId = formData.get("course_id")?.toString() ?? "";
  const videoUrl = parseText(formData.get("video_url"));

  if (!isValidUrl(videoUrl)) {
    throw new Error("Lesson video URLs must use http or https.");
  }

  const { error } = await supabase
    .from("lessons")
    .update({
      title: formData.get("title")?.toString().trim() || "Untitled lesson",
      duration_minutes: parseDurationMinutesFromFields(
        formData.get("duration_hours"),
        formData.get("duration_minutes"),
      ),
      video_url: videoUrl,
      sort_order: parseRequiredNumber(formData.get("sort_order")),
    })
    .eq("id", lessonId)
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  revalidateLearningPaths(courseId);
}

export async function deleteLessonAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const lessonId = formData.get("lesson_id")?.toString() ?? "";
  const courseId = formData.get("course_id")?.toString() ?? "";

  const { error } = await supabase.from("lessons").delete().eq("id", lessonId).eq("user_id", user.id);
  if (error) {
    throw error;
  }

  revalidateLearningPaths(courseId);
}

export async function toggleLessonCompletionAction(formData: FormData) {
  const { supabase, user } = await getSessionContext();
  const lessonId = formData.get("lesson_id")?.toString() ?? "";

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, user_id, course_id, section_id, duration_minutes, completed")
    .eq("id", lessonId)
    .eq("user_id", user.id)
    .single();

  if (lessonError || !lesson) {
    throw lessonError ?? new Error("Lesson not found.");
  }

  const nextCompleted = !lesson.completed;
  const timestamp = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("lessons")
    .update({
      completed: nextCompleted,
      completed_at: nextCompleted ? timestamp : null,
    })
    .eq("id", lessonId)
    .eq("user_id", user.id);

  if (updateError) {
    throw updateError;
  }

  if (nextCompleted) {
    const { data: existingLog, error: existingError } = await supabase
      .from("activity_logs")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingLog) {
      const { error: insertError } = await supabase.from("activity_logs").insert({
        user_id: user.id,
        course_id: lesson.course_id,
        section_id: lesson.section_id,
        lesson_id: lesson.id,
        duration_minutes: lesson.duration_minutes,
        completed_at: timestamp,
      });

      if (insertError && insertError.code !== "23505") {
        throw insertError;
      }
    }
  } else {
    const { error: deleteError } = await supabase
      .from("activity_logs")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lesson.id);

    if (deleteError) {
      throw deleteError;
    }
  }

  revalidateLearningPaths(lesson.course_id);
}
