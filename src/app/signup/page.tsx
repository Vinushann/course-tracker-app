import { redirect } from "next/navigation";
import { signupAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";

type SignupPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <AuthForm mode="signup" action={signupAction} message={params.error} />;
}
