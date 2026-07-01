"use client";

import { useState } from "react";
import Link from "next/link";
import { createCourseAction, deleteCourseAction, updateCourseAction } from "@/app/actions/courses";
import { SubmitButton } from "@/components/submit-button";
import { getCourseProgress } from "@/lib/progress";
import type { CourseWithSections } from "@/lib/types";
import { formatDate, formatMinutes } from "@/lib/utils";

type CourseManagerProps = {
  courses: CourseWithSections[];
};

export function CourseManager({ courses }: CourseManagerProps) {
  const [showCreate, setShowCreate] = useState(courses.length === 0);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <section className="soft-ring rounded-[28px] border border-line bg-surface p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-muted">Courses</p>
            <h2 className="text-2xl font-semibold">Track each learning path clearly</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCreate((current) => !current)}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium transition hover:border-accent hover:text-accent"
          >
            {showCreate ? "Hide form" : "Add course"}
          </button>
        </div>

        {showCreate ? (
          <form action={createCourseAction} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium">Course title</span>
              <input
                name="title"
                required
                placeholder="SQL Course"
                className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Category</span>
              <input
                name="category"
                placeholder="Databases"
                className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
              />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium">Description</span>
              <textarea
                name="description"
                rows={3}
                placeholder="Optional course notes"
                className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium">Fallback target hours</span>
              <input
                name="target_hours"
                type="number"
                step="0.5"
                min="0"
                placeholder="13"
                className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
              />
            </label>
            <div className="flex items-end">
              <SubmitButton>Create course</SubmitButton>
            </div>
          </form>
        ) : null}
      </section>

      {courses.length === 0 ? (
        <section className="soft-ring rounded-[28px] border border-dashed border-line bg-surface px-6 py-14 text-center">
          <h3 className="text-xl font-semibold">No courses yet</h3>
          <p className="mt-2 text-sm text-muted">Add your first course to start tracking sections, lessons, and completed time.</p>
        </section>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {courses.map((course) => {
          const progress = getCourseProgress(course);
          const isEditing = editingCourseId === course.id;

          return (
            <article key={course.id} className="soft-ring rounded-[28px] border border-line bg-surface p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-muted">{course.category || "Uncategorized"}</p>
                  <h3 className="mt-2 text-2xl font-semibold">{course.title}</h3>
                  <p className="mt-1 text-sm text-muted">Created {formatDate(course.created_at)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCourseId(isEditing ? null : course.id)}
                  className="rounded-full border border-line px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted"
                >
                  {isEditing ? "Close" : "Edit"}
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-surface-strong p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Completed</p>
                  <p className="mt-2 text-2xl font-semibold">{formatMinutes(progress.completedMinutes)}</p>
                </div>
                <div className="rounded-2xl bg-surface-strong p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">Remaining</p>
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
                  href={`/courses/${course.id}`}
                  className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background"
                >
                  Open details
                </Link>
                <form action={deleteCourseAction}>
                  <input type="hidden" name="course_id" value={course.id} />
                  <SubmitButton className="bg-transparent text-foreground soft-ring border border-line">Delete</SubmitButton>
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
                      className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium">Category</span>
                    <input
                      name="category"
                      defaultValue={course.category ?? ""}
                      className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium">Description</span>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={course.description ?? ""}
                      className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
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
                      className="w-full rounded-2xl border border-line bg-surface-strong/90 px-4 py-3 outline-none focus:border-accent"
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
