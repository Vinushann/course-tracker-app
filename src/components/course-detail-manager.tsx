"use client";

import { useState } from "react";
import {
  createLessonAction,
  createSectionAction,
  deleteLessonAction,
  deleteSectionAction,
  toggleLessonCompletionAction,
  updateLessonAction,
  updateSectionAction,
} from "@/app/actions/courses";
import { SubmitButton } from "@/components/submit-button";
import { getCourseProgress, getLessonCompletionTimestamp } from "@/lib/progress";
import type { CourseWithSections } from "@/lib/types";
import { formatMinutes } from "@/lib/utils";

type CourseDetailManagerProps = {
  course: CourseWithSections;
};

export function CourseDetailManager({ course }: CourseDetailManagerProps) {
  const [showSectionForm, setShowSectionForm] = useState(course.sections.length === 0);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [openLessonFormSectionId, setOpenLessonFormSectionId] = useState<string | null>(course.sections[0]?.id ?? null);
  const progress = getCourseProgress(course);

  return (
    <div className="space-y-6">
      <section className="soft-ring rounded-[32px] border border-line bg-surface p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">{course.category || "Uncategorized"}</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {course.description || "Add sections and lessons to build a clear, honest view of your progress."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-surface-strong p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Completed</p>
              <p className="mt-2 text-2xl font-semibold">{formatMinutes(progress.completedMinutes)}</p>
            </div>
            <div className="rounded-2xl bg-surface-strong p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Remaining</p>
              <p className="mt-2 text-2xl font-semibold">{formatMinutes(progress.remainingMinutes)}</p>
            </div>
            <div className="rounded-2xl bg-surface-strong p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-muted">Progress</p>
              <p className="mt-2 text-2xl font-semibold">{progress.progressPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Total tracked time</span>
            <span>{formatMinutes(progress.totalMinutes)}</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-accent-soft">
            <div className="h-full rounded-full bg-accent" style={{ width: `${progress.progressPercentage}%` }} />
          </div>
        </div>
      </section>

      <section className="soft-ring rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Sections</p>
            <h2 className="text-2xl font-semibold">Organize the course into manageable chunks</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowSectionForm((current) => !current)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            {showSectionForm ? "Hide form" : "Add section"}
          </button>
        </div>

        {showSectionForm ? (
          <form action={createSectionAction} className="mt-6 flex flex-col gap-4 sm:flex-row">
            <input type="hidden" name="course_id" value={course.id} />
            <input
              name="title"
              required
              placeholder="SQL Joins"
              className="min-w-0 flex-1 rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
            />
            <SubmitButton>Add section</SubmitButton>
          </form>
        ) : null}
      </section>

      <div className="space-y-5">
        {course.sections.map((section) => {
          const isEditingSection = editingSectionId === section.id;

          return (
            <section key={section.id} className="soft-ring rounded-[28px] border border-line bg-surface p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Section {section.sort_order}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{section.title}</h3>
                  <p className="mt-1 text-sm text-muted">{section.lessons.length} lessons</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenLessonFormSectionId((current) => (current === section.id ? null : section.id))
                    }
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium"
                  >
                    {openLessonFormSectionId === section.id ? "Close lesson form" : "Add lesson"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSectionId(isEditingSection ? null : section.id)}
                    className="rounded-full border border-line px-4 py-2 text-sm font-medium"
                  >
                    {isEditingSection ? "Close edit" : "Edit section"}
                  </button>
                  <form action={deleteSectionAction}>
                    <input type="hidden" name="section_id" value={section.id} />
                    <input type="hidden" name="course_id" value={course.id} />
                    <SubmitButton className="bg-transparent text-foreground soft-ring border border-line">Delete</SubmitButton>
                  </form>
                </div>
              </div>

              {isEditingSection ? (
                <form action={updateSectionAction} className="mt-5 grid gap-4 sm:grid-cols-[1fr_140px_auto]">
                  <input type="hidden" name="section_id" value={section.id} />
                  <input type="hidden" name="course_id" value={course.id} />
                  <input
                    name="title"
                    required
                    defaultValue={section.title}
                    className="rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
                  />
                  <input
                    name="sort_order"
                    type="number"
                    min="1"
                    defaultValue={section.sort_order}
                    className="rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
                  />
                  <SubmitButton>Save section</SubmitButton>
                </form>
              ) : null}

              {openLessonFormSectionId === section.id ? (
                <form action={createLessonAction} className="mt-6 grid gap-4 rounded-[24px] bg-surface-strong p-4 lg:grid-cols-2">
                  <input type="hidden" name="course_id" value={course.id} />
                  <input type="hidden" name="section_id" value={section.id} />
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Lesson title</span>
                    <input
                      name="title"
                      required
                      placeholder="Inner Join"
                      className="w-full rounded-2xl border border-line bg-background/60 px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Duration in minutes</span>
                    <input
                      name="duration_minutes"
                      type="number"
                      min="0"
                      required
                      placeholder="18"
                      className="w-full rounded-2xl border border-line bg-background/60 px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium">Video URL (optional)</span>
                    <input
                      name="video_url"
                      type="url"
                      placeholder="https://example.com/video"
                      className="w-full rounded-2xl border border-line bg-background/60 px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <div className="lg:col-span-2">
                    <SubmitButton>Add lesson</SubmitButton>
                  </div>
                </form>
              ) : null}

              <div className="mt-6 space-y-4">
                {section.lessons.length === 0 ? (
                  <div className="rounded-[22px] border border-dashed border-line px-4 py-6 text-sm text-muted">
                    No lessons in this section yet.
                  </div>
                ) : null}

                {section.lessons.map((lesson) => {
                  const isEditingLesson = editingLessonId === lesson.id;

                  return (
                    <article key={lesson.id} className="rounded-[24px] border border-line bg-surface-strong/70 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-1 items-start gap-3">
                          <form action={toggleLessonCompletionAction} className="pt-1">
                            <input type="hidden" name="lesson_id" value={lesson.id} />
                            <button
                              type="submit"
                              aria-label={lesson.completed ? "Mark lesson incomplete" : "Mark lesson complete"}
                              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                lesson.completed
                                  ? "border-success bg-success text-white"
                                  : "border-line bg-surface text-transparent"
                              }`}
                            >
                              ✓
                            </button>
                          </form>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h4 className="text-lg font-semibold">{lesson.title}</h4>
                              <span className="rounded-full bg-surface-strong px-3 py-1 text-xs uppercase tracking-[0.18em] text-muted">
                                {formatMinutes(lesson.duration_minutes)}
                              </span>
                              {lesson.completed ? (
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                  Completed
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-sm text-muted">{getLessonCompletionTimestamp(lesson)}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {lesson.video_url ? (
                            <a
                              href={lesson.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-full border border-line px-4 py-2 text-sm font-medium"
                            >
                              Open Video
                            </a>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => setEditingLessonId(isEditingLesson ? null : lesson.id)}
                            className="rounded-full border border-line px-4 py-2 text-sm font-medium"
                          >
                            {isEditingLesson ? "Close edit" : "Edit lesson"}
                          </button>
                          <form action={deleteLessonAction}>
                            <input type="hidden" name="lesson_id" value={lesson.id} />
                            <input type="hidden" name="course_id" value={course.id} />
                            <SubmitButton className="bg-transparent text-foreground soft-ring border border-line">Delete</SubmitButton>
                          </form>
                        </div>
                      </div>

                      {isEditingLesson ? (
                        <form action={updateLessonAction} className="mt-5 grid gap-4 border-t border-line pt-5 lg:grid-cols-2">
                          <input type="hidden" name="lesson_id" value={lesson.id} />
                          <input type="hidden" name="course_id" value={course.id} />
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Lesson title</span>
                            <input
                              name="title"
                              required
                              defaultValue={lesson.title}
                              className="w-full rounded-2xl border border-line bg-background/60 px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Duration in minutes</span>
                            <input
                              name="duration_minutes"
                              type="number"
                              min="0"
                              required
                              defaultValue={lesson.duration_minutes}
                              className="w-full rounded-2xl border border-line bg-background/60 px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Video URL</span>
                            <input
                              name="video_url"
                              type="url"
                              defaultValue={lesson.video_url ?? ""}
                              className="w-full rounded-2xl border border-line bg-background/60 px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Sort order</span>
                            <input
                              name="sort_order"
                              type="number"
                              min="1"
                              defaultValue={lesson.sort_order}
                              className="w-full rounded-2xl border border-line bg-background/60 px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                          <div className="lg:col-span-2">
                            <SubmitButton>Save lesson</SubmitButton>
                          </div>
                        </form>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
