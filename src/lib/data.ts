import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { buildDashboardSummary, sortSectionsAndLessons } from "@/lib/progress";
import type { ActivityLog, CourseWithSections } from "@/lib/types";

function isAuthSessionMissingError(error: { name?: string; message?: string; status?: number } | null) {
  if (!error) {
    return false;
  }

  return error.name === "AuthSessionMissingError" || error.message === "Auth session missing!" || error.status === 400;
}

function isSchemaMissingError(error: { code?: string; message?: string } | null) {
  if (!error) {
    return false;
  }

  return error.code === "PGRST205" || error.message?.includes("schema cache") || false;
}

type AppSupabaseClient = SupabaseClient;

async function getAuthenticatedUser(supabase?: AppSupabaseClient): Promise<User | null> {
  const client = supabase ?? (await createClient());
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) {
    if (isAuthSessionMissingError(error)) {
      return null;
    }
    throw error;
  }

  return user ?? null;
}

async function getUserId(supabase?: AppSupabaseClient) {
  const user = await getAuthenticatedUser(supabase);

  return user?.id ?? null;
}

export async function ensureProfile(supabase?: AppSupabaseClient) {
  const client = supabase ?? (await createClient());
  const user = await getAuthenticatedUser(client);

  if (!user?.id || !user.email) {
    return null;
  }

  const { error: profileError } = await client.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
    },
    {
      onConflict: "id",
    },
  );

  if (profileError) {
    throw profileError;
  }

  return user;
}

export async function getCoursesForUser(supabase?: AppSupabaseClient) {
  const client = supabase ?? (await createClient());
  const userId = await getUserId(client);

  if (!userId) {
    return [];
  }

  const { data, error } = await client
    .from("courses")
    .select(
      `
        *,
        sections (
          *,
          lessons (*)
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (isSchemaMissingError(error)) {
      return [];
    }
    throw error;
  }

  return ((data ?? []) as CourseWithSections[]).map(sortSectionsAndLessons);
}

export async function getCourseById(courseId: string, supabase?: AppSupabaseClient) {
  const client = supabase ?? (await createClient());
  const userId = await getUserId(client);

  if (!userId) {
    return null;
  }

  const { data, error } = await client
    .from("courses")
    .select(
      `
        *,
        sections (
          *,
          lessons (*)
        )
      `,
    )
    .eq("id", courseId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    if (isSchemaMissingError(error)) {
      return null;
    }
    throw error;
  }

  return sortSectionsAndLessons(data as CourseWithSections);
}

export async function getActivityLogsForUser(supabase?: AppSupabaseClient) {
  const client = supabase ?? (await createClient());
  const userId = await getUserId(client);

  if (!userId) {
    return [];
  }

  const { data, error } = await client
    .from("activity_logs")
    .select("*")
    .eq("user_id", userId)
    .order("completed_at", { ascending: true });

  if (error) {
    if (isSchemaMissingError(error)) {
      return [];
    }
    throw error;
  }

  return (data ?? []) as ActivityLog[];
}

export async function getDashboardData() {
  const {
    supabase,
  } = { supabase: await createClient() };
  const { error: setupError } = await supabase.from("courses").select("id").limit(1);

  if (isSchemaMissingError(setupError)) {
    return {
      courses: [],
      activityLogs: [],
      summary: buildDashboardSummary([], []),
      setupStatus: {
        schemaReady: false,
        message: "Supabase tables are not set up yet. Run the SQL migration in supabase/migrations/0001_project_x.sql to finish setup.",
      },
    };
  }

  const [courses, activityLogs] = await Promise.all([getCoursesForUser(supabase), getActivityLogsForUser(supabase)]);

  return {
    courses,
    activityLogs,
    summary: buildDashboardSummary(courses, activityLogs),
    setupStatus: {
      schemaReady: true,
    },
  };
}
