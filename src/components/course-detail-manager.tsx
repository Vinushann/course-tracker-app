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
import { getCourseProgress, getLessonCompletionTimestamp, getSectionProgress } from "@/lib/progress";
import type { CourseWithSections } from "@/lib/types";
import { formatMinutes, splitDurationMinutes } from "@/lib/utils";

type CourseDetailManagerProps = {
  course: CourseWithSections;
  mode?: "manage" | "track";
};

export function CourseDetailManager({ course, mode = "manage" }: CourseDetailManagerProps) {
  const isTrackMode = mode === "track";
  const [showSectionForm, setShowSectionForm] = useState(course.sections.length === 0);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [openLessonFormSectionId, setOpenLessonFormSectionId] = useState<string | null>(course.sections[0]?.id ?? null);
  const [openSectionIds, setOpenSectionIds] = useState<string[]>(course.sections[0]?.id ? [course.sections[0].id] : []);
  const progress = getCourseProgress(course);

  function toggleSection(sectionId: string) {
    setOpenSectionIds((current) =>
      current.includes(sectionId) ? current.filter((id) => id !== sectionId) : [...current, sectionId],
    );
  }

  return (
    <div className="space-y-6">
      <section className="soft-ring rounded-[24px] border border-line bg-surface p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
              {isTrackMode ? "Tracking view" : "Course management"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{course.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              {course.description ||
                (isTrackMode
                  ? "Tick lessons as you complete them and let the app update your progress automatically."
                  : "Add sections and lessons to build a clear, honest view of your progress.")}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[18px] bg-surface-strong p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Lessons done</p>
              <p className="mt-2 text-2xl font-semibold">
                {progress.completedLessonsCount}/{progress.totalLessonsCount}
              </p>
            </div>
            <div className="rounded-[18px] bg-surface-strong p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Completed</p>
              <p className="mt-2 text-2xl font-semibold">{formatMinutes(progress.completedMinutes)}</p>
            </div>
            <div className="rounded-[18px] bg-surface-strong p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Remaining</p>
              <p className="mt-2 text-2xl font-semibold">{formatMinutes(progress.remainingMinutes)}</p>
            </div>
            <div className="rounded-[18px] bg-surface-strong p-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Progress</p>
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

      {!isTrackMode ? (
        <section className="soft-ring rounded-[24px] border border-line bg-surface p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-muted">Sections</p>
              <h2 className="text-2xl font-semibold tracking-tight">Organize the course into manageable chunks</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowSectionForm((current) => !current)}
              className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:bg-surface-strong"
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
                className="min-w-0 flex-1 rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
              />
              <SubmitButton>Add section</SubmitButton>
            </form>
          ) : null}
        </section>
      ) : null}

      <div className="space-y-5">
        {course.sections.map((section) => {
          const isEditingSection = editingSectionId === section.id;
          const sectionProgress = getSectionProgress(section);
          const isSectionOpen = openSectionIds.includes(section.id);

          return (
            <section key={section.id} className="soft-ring rounded-[24px] border border-line bg-surface p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex min-w-0 flex-1 items-start justify-between gap-4 text-left"
                >
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-muted">Section {section.sort_order}</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">{section.title}</h3>
                    <p className="mt-1 text-sm text-muted">
                      {sectionProgress.completedLessonsCount}/{sectionProgress.totalLessonsCount} lessons completed
                    </p>
                  </div>
                  <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                    {isSectionOpen ? "Hide" : "Show"}
                  </span>
                </button>

                {!isTrackMode ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenLessonFormSectionId((current) => (current === section.id ? null : section.id))
                      }
                      className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:bg-surface-strong"
                    >
                      {openLessonFormSectionId === section.id ? "Close lesson form" : "Add lesson"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSectionId(isEditingSection ? null : section.id)}
                      className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:bg-surface-strong"
                    >
                      {isEditingSection ? "Close edit" : "Edit section"}
                    </button>
                    <form action={deleteSectionAction}>
                      <input type="hidden" name="section_id" value={section.id} />
                      <input type="hidden" name="course_id" value={course.id} />
                      <SubmitButton variant="outline" className="soft-ring">
                        Delete
                      </SubmitButton>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-full border border-accent/30 bg-accent-soft px-4 py-2 text-sm font-semibold text-accent">
                    {sectionProgress.progressPercentage}% tracked
                  </div>
                )}
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm text-muted">
                  <span>{formatMinutes(sectionProgress.completedMinutes)} completed</span>
                  <span>{formatMinutes(sectionProgress.remainingMinutes)} remaining</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-accent-soft">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${sectionProgress.progressPercentage}%` }} />
                </div>
              </div>

              {isSectionOpen && !isTrackMode && isEditingSection ? (
                <form action={updateSectionAction} className="mt-5 grid gap-4 sm:grid-cols-[1fr_140px_auto]">
                  <input type="hidden" name="section_id" value={section.id} />
                  <input type="hidden" name="course_id" value={course.id} />
                  <input
                    name="title"
                    required
                    defaultValue={section.title}
                    className="rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
                  />
                  <input
                    name="sort_order"
                    type="number"
                    min="1"
                    defaultValue={section.sort_order}
                    className="rounded-[16px] border border-line bg-surface-strong px-4 py-3 outline-none focus:border-accent"
                  />
                  <SubmitButton>Save section</SubmitButton>
                </form>
              ) : null}

              {isSectionOpen && !isTrackMode && openLessonFormSectionId === section.id ? (
                <form action={createLessonAction} className="mt-6 grid gap-4 rounded-[18px] bg-surface-strong p-4 lg:grid-cols-2">
                  <input type="hidden" name="course_id" value={course.id} />
                  <input type="hidden" name="section_id" value={section.id} />
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Lesson title</span>
                    <input
                      name="title"
                      required
                      className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium">Hours</span>
                      <input
                        name="duration_hours"
                        type="number"
                        min="0"
                        defaultValue="0"
                        className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium">Minutes</span>
                      <input
                        name="duration_minutes"
                        type="number"
                        min="0"
                        required
                        defaultValue="0"
                        className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                      />
                    </label>
                  </div>
                  <label className="space-y-2 lg:col-span-2">
                    <span className="text-sm font-medium">Video URL (optional)</span>
                    <input
                      name="video_url"
                      type="url"
                      className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <div className="lg:col-span-2">
                    <SubmitButton>Add lesson</SubmitButton>
                  </div>
                </form>
              ) : null}

              {isSectionOpen ? <div className="mt-6 space-y-4">
                {section.lessons.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-line px-4 py-6 text-sm text-muted">
                    No lessons in this section yet.
                  </div>
                ) : null}

                {section.lessons.map((lesson) => {
                  const isEditingLesson = editingLessonId === lesson.id;
                  const lessonDuration = splitDurationMinutes(lesson.duration_minutes);

                  return (
                    <article key={lesson.id} className="rounded-[18px] border border-line bg-surface-strong/70 p-4">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-1 items-start gap-3">
                          <form action={toggleLessonCompletionAction} className="pt-1">
                            <input type="hidden" name="lesson_id" value={lesson.id} />
                            <button
                              type="submit"
                              aria-label={lesson.completed ? "Mark lesson incomplete" : "Mark lesson complete"}
                              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                lesson.completed
                                  ? "border-success bg-success text-[#0f1412]"
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
                                <span className="rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
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
                              className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:bg-surface"
                            >
                              Open Video
                            </a>
                          ) : null}
                          {!isTrackMode ? (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditingLessonId(isEditingLesson ? null : lesson.id)}
                                className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:bg-surface"
                              >
                                {isEditingLesson ? "Close edit" : "Edit lesson"}
                              </button>
                              <form action={deleteLessonAction}>
                                <input type="hidden" name="lesson_id" value={lesson.id} />
                                <input type="hidden" name="course_id" value={course.id} />
                                <SubmitButton variant="outline" className="soft-ring">Delete</SubmitButton>
                              </form>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {!isTrackMode && isEditingLesson ? (
                        <form action={updateLessonAction} className="mt-5 grid gap-4 border-t border-line pt-5 lg:grid-cols-2">
                          <input type="hidden" name="lesson_id" value={lesson.id} />
                          <input type="hidden" name="course_id" value={course.id} />
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Lesson title</span>
                            <input
                              name="title"
                              required
                              defaultValue={lesson.title}
                              className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                              <span className="text-sm font-medium">Hours</span>
                              <input
                                name="duration_hours"
                                type="number"
                                min="0"
                                required
                                defaultValue={lessonDuration.hours}
                                className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                              />
                            </label>
                            <label className="space-y-2">
                              <span className="text-sm font-medium">Minutes</span>
                              <input
                                name="duration_minutes"
                                type="number"
                                min="0"
                                required
                                defaultValue={lessonDuration.minutes}
                                className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                              />
                            </label>
                          </div>
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Video URL</span>
                            <input
                              name="video_url"
                              type="url"
                              defaultValue={lesson.video_url ?? ""}
                              className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
                            />
                          </label>
                          <label className="space-y-2">
                            <span className="text-sm font-medium">Sort order</span>
                            <input
                              name="sort_order"
                              type="number"
                              min="1"
                              defaultValue={lesson.sort_order}
                              className="w-full rounded-[16px] border border-line bg-background/40 px-4 py-3 outline-none focus:border-accent"
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
              </div> : null}
            </section>
          );
        })}
      </div>
    </div>
  );
}
