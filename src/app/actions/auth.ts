"use server";

import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

function buildRedirect(path: string, message: string, type: "error" | "success" = "error") {
  const params = new URLSearchParams({
    [type]: message,
  });

  return `${path}?${params.toString()}`;
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

  await ensureProfile();

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

  await ensureProfile();

  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
