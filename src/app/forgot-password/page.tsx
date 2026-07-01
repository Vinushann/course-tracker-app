import { redirect } from "next/navigation";
import { PasswordResetRequestForm } from "@/components/password-reset-request-form";
import { createClient } from "@/lib/supabase/server";

type ForgotPasswordPageProps = {
  searchParams: Promise<{
    error?: string;
    success?: string;
  }>;
};

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <PasswordResetRequestForm message={params.error} success={params.success} />;
}
