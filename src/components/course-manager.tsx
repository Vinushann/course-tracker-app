"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createCourseAction, deleteCourseAction, updateCourseAction } from "@/app/actions/courses";
import { SubmitButton } from "@/components/submit-button";
import { getCourseProgress } from "@/lib/progress";
import type { CourseBlueprintSectionInput, CourseWithSections } from "@/lib/types";
import { formatDate, formatMinutes } from "@/lib/utils";

type CourseManagerProps = {
  courses: CourseWithSections[];
  initialShowCreate?: boolean;
};

const DEFAULT_SECTION_COUNT = 1;
const DEFAULT_LESSON_COUNT = 1;

function createDraftLesson() {
  return {
    title: "",
    duration_minutes: "",
    video_url: "",
  };
}

function createDraftSection() {
  return {
    title: "",
    lessons: Array.from({ length: DEFAULT_LESSON_COUNT }, () => createDraftLesson()),
  };
}

function createDefaultCourseDraft() {
  return Array.from({ length: DEFAULT_SECTION_COUNT }, () => createDraftSection());
}

export function CourseManager({ courses, initialShowCreate = false }: CourseManagerProps) {
  const [showCreate] = useState(courses.length === 0 || initialShowCreate);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseStructure, setCourseStructure] = useState(createDefaultCourseDraft);

  const serializedBlueprint = useMemo(() => {
    const payload: CourseBlueprintSectionInput[] = courseStructure.map((section) => ({
      title: section.title.trim(),
      lessons: section.lessons.map((lesson) => ({
        title: lesson.title.trim(),
        duration_minutes: Number.isFinite(Number(lesson.duration_minutes)) ? Number(lesson.duration_minutes) : 0,
        video_url: lesson.video_url.trim() || null,
      })),
    }));

    return JSON.stringify(payload);
  }, [courseStructure]);

  function updateSectionTitle(sectionIndex: number, value: string) {
    setCourseStructure((current) =>
      current.map((section, index) => (index === sectionIndex ? { ...section, title: value } : section)),
    );
  }

  function updateLessonField(
    sectionIndex: number,
    lessonIndex: number,
    field: "title" | "duration_minutes" | "video_url",
    value: string,
  ) {
    setCourseStructure((current) =>
      current.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          lessons: section.lessons.map((lesson, innerIndex) => {
            if (innerIndex !== lessonIndex) {
              return lesson;
            }

            return {
              ...lesson,
              [field]: value,
            };
          }),
        };
      }),
    );
  }

  function addSection() {
    setCourseStructure((current) => [...current, createDraftSection()]);
  }

  function removeSection(sectionIndex: number) {
    setCourseStructure((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter((_, index) => index !== sectionIndex);
    });
  }

  function addLesson(sectionIndex: number) {
    setCourseStructure((current) =>
      current.map((section, index) =>
        index === sectionIndex
          ? {
              ...section,
              lessons: [...section.lessons, createDraftLesson()],
            }
          : section,
      ),
    );
  }

  function removeLesson(sectionIndex: number, lessonIndex: number) {
    setCourseStructure((current) =>
      current.map((section, index) => {
        if (index !== sectionIndex || section.lessons.length === 1) {
          return section;
        }

        return {
          ...section,
          lessons: section.lessons.filter((_, innerIndex) => innerIndex !== lessonIndex),
        };
      }),
    );
  }

  return (
    <div className="space-y-6">
      <section className="soft-ring rounded-[24px] border border-line bg-surface p-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Course setup</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Build the course structure once</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            Keep the setup clean. Add only the sections and lessons you actually need to track.
          </p>
        </div>

        {showCreate ? (
          <form action={createCourseAction} className="mt-6 space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium">Course title</span>
                <input
                  name="title"
                  required
                  className="w-full rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
                />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-sm font-medium">Description</span>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium">Total duration target in hours</span>
                <input
                  name="target_hours"
                  type="number"
                  step="0.5"
                  min="0"
                  className="w-full rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
                />
              </label>
            </div>

            <input type="hidden" name="course_blueprint" value={serializedBlueprint} />

            <div className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Structure</p>
                <h3 className="mt-2 text-xl font-semibold">Start with one section and one lesson</h3>
                <p className="mt-2 max-w-2xl text-sm text-muted">
                  Begin with one subsection and one lesson. Add more only when you need them.
                </p>
              </div>

              {courseStructure.map((section, sectionIndex) => (
                <div key={`draft-section-${sectionIndex}`} className="rounded-[20px] border border-line bg-surface-strong/50 p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted">
                        Sub section {sectionIndex + 1}
                      </p>
                      <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted">
                        {section.lessons.length} lesson{section.lessons.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => addLesson(sectionIndex)}
                        className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:bg-surface"
                      >
                        Add lesson
                      </button>
                      {courseStructure.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeSection(sectionIndex)}
                          className="rounded-full border border-line px-4 py-2 text-sm font-medium text-muted transition hover:border-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium">Sub section title</span>
                    <input
                      value={section.title}
                      onChange={(event) => updateSectionTitle(sectionIndex, event.target.value)}
                      className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>

                  <div className="mt-5 grid gap-3">
                    {section.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={`draft-section-${sectionIndex}-lesson-${lessonIndex}`}
                        className="rounded-[18px] border border-line bg-background/20 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground/90">Lesson {lessonIndex + 1}</p>
                          {section.lessons.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removeLesson(sectionIndex, lessonIndex)}
                              className="rounded-full border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:border-red-400 hover:text-red-300"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_160px_minmax(0,1.2fr)]">
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Lesson title</span>
                            <input
                              value={lesson.title}
                              onChange={(event) =>
                                updateLessonField(sectionIndex, lessonIndex, "title", event.target.value)
                              }
                              className="w-full rounded-[16px] border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Minutes</span>
                            <input
                              type="number"
                              min="0"
                              value={lesson.duration_minutes}
                              onChange={(event) =>
                                updateLessonField(sectionIndex, lessonIndex, "duration_minutes", event.target.value)
                              }
                              className="w-full rounded-[16px] border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Video URL</span>
                            <input
                              type="url"
                              value={lesson.video_url}
                              onChange={(event) =>
                                updateLessonField(sectionIndex, lessonIndex, "video_url", event.target.value)
                              }
                              className="w-full rounded-[16px] border border-line bg-surface px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={addSection}
                  aria-label="Add another subsection"
                  className="inline-flex items-center gap-2 rounded-full border border-dashed border-line bg-surface-strong px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface"
                >
                  <span className="text-lg leading-none">+</span>
                  Add subsection
                </button>
              </div>
            </div>

            <div className="flex justify-start">
              <SubmitButton>Create course</SubmitButton>
            </div>
          </form>
        ) : null}
      </section>

      {courses.length === 0 ? (
        <section className="soft-ring rounded-[24px] border border-dashed border-line bg-surface px-6 py-14 text-center">
          <h3 className="text-xl font-semibold">No courses yet</h3>
          <p className="mt-2 text-sm text-muted">Add your first course to start tracking sections, lessons, and completed time.</p>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {courses.map((course) => {
          const progress = getCourseProgress(course);
          const isEditing = editingCourseId === course.id;

          return (
            <article key={course.id} className="soft-ring rounded-[24px] border border-line bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">{course.title}</h3>
                  <p className="mt-1 text-sm text-muted">Created {formatDate(course.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCourseId(isEditing ? null : course.id)}
                  className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted"
                >
                  {isEditing ? "Close" : "Edit"}
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[18px] bg-surface-strong p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Completed</p>
                  <p className="mt-2 text-2xl font-semibold">{formatMinutes(progress.completedMinutes)}</p>
                </div>
                <div className="rounded-[18px] bg-surface-strong p-4">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Remaining</p>
                  <p className="mt-2 text-2xl font-semibold">{formatMinutes(progress.remainingMinutes)}</p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress.progressPercentage}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-accent-soft">
                  <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress.progressPercentage}%` }} />
                </div>
              </div>

              <div className="mt-5 grid gap-2 text-sm text-muted">
                <p>Total tracked time: {formatMinutes(progress.totalMinutes)}</p>
                <p>Completed lessons: {progress.completedLessonsCount}</p>
                <p>Total lessons: {progress.totalLessonsCount}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={`/courses/${course.id}?mode=track`}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-[#0f1412]"
                >
                  Track
                </Link>
                <Link
                  href={`/courses/${course.id}`}
                  className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-foreground"
                >
                  Manage
                </Link>
                <form action={deleteCourseAction}>
                  <input type="hidden" name="course_id" value={course.id} />
                  <SubmitButton variant="outline" className="soft-ring">Delete</SubmitButton>
                </form>
              </div>

              {isEditing ? (
                <form action={updateCourseAction} className="mt-6 grid gap-4 border-t border-line pt-6 md:grid-cols-2">
                  <input type="hidden" name="course_id" value={course.id} />
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Course title</span>
                    <input
                      name="title"
                      required
                      defaultValue={course.title}
                      className="w-full rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium">Description</span>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={course.description ?? ""}
                      className="w-full rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Fallback target hours</span>
                    <input
                      name="target_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      defaultValue={course.target_hours ?? ""}
                      className="w-full rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <div className="flex items-end">
                    <SubmitButton>Save changes</SubmitButton>
                  </div>
                </form>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
