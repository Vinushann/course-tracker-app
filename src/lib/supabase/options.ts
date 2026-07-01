const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

export function getSupabaseCookieOptions() {
  return {
    name: "project-x-auth",
    lifetime: SESSION_MAX_AGE,
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
  };
}

export function getSupabaseBrowserAuthOptions() {
  return {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  };
}
