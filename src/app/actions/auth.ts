"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

function buildRedirect(path: string, message: string, type: "error" | "success" = "error") {
  const params = new URLSearchParams({
    [type]: message,
  });

  return `${path}?${params.toString()}`;
}

async function getBaseUrl() {
  const headerStore = await headers();
  const origin = headerStore.get("origin");

  if (origin) {
    return origin;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(buildRedirect("/login", error.message));
  }

  await ensureProfile(supabase);

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect(buildRedirect("/signup", error.message));
  }

  if (!data.session) {
    redirect(buildRedirect("/login", "Account created. Check your inbox if email confirmation is enabled.", "success"));
  }

  await ensureProfile(supabase);

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get("email")?.toString().trim() ?? "";
  const supabase = await createClient();
  const baseUrl = await getBaseUrl();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/callback?next=/reset-password`,
  });

  if (error) {
    redirect(buildRedirect("/forgot-password", error.message));
  }

  redirect(
    buildRedirect(
      "/forgot-password",
      "Reset link sent. Check your email and open the link to choose a new password.",
      "success",
    ),
  );
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get("password")?.toString() ?? "";
  const confirmPassword = formData.get("confirm_password")?.toString() ?? "";
  const supabase = await createClient();

  if (password.length < 6) {
    redirect(buildRedirect("/reset-password", "Password must be at least 6 characters."));
  }

  if (password !== confirmPassword) {
    redirect(buildRedirect("/reset-password", "Passwords do not match."));
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    redirect(buildRedirect("/reset-password", error.message));
  }

  redirect(buildRedirect("/login", "Password updated successfully. Please log in.", "success"));
}
